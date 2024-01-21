import { Op, literal } from 'sequelize';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { Genre, GenreId } from '../../../domain/genre.aggregate';
import {
  GenreSearchParams,
  GenreSearchResult,
  IGenreRepository,
} from '../../../domain/genre-repository';
import { GenreModel } from './genre-model';
import { GenreModelMapper } from './genre-model-mapper';
import { InvalidArgumentError } from '../../../../shared/domain/errors/invalid-argument.error';
import { NotFoundError } from '../../../../shared/domain/errors/not_found';
import { UnitOfWorkSequelize } from '../../../../shared/infra/db/sequelize/unit-of-work-sequelize';

//lazy loading relacionamentos sao retornados somente quando se aciona ex:include: ['categories_id']
//faz um select para cada relacionado, para poucos relacionados nao é um problema, mas para muitos gera n+1

//eager loading resolve o problema de muitos selects do lazy loading, faz 1 query para buscar tudo
//faz um relacionamento direto com a tabela intermediaria GenreCategoryModel, ao inves de usar a tabela CategoryModel
export class GenreSequelizeRepository implements IGenreRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) =>
        //mudar a ordenacao de letras do mysql para asc
        `binary ${this.genreModel.name}.name ${sort_dir}`,
    },
  };
  constructor(
    private genreModel: typeof GenreModel,
    private uow: UnitOfWorkSequelize,
  ) {}

  async insert(entity: Genre): Promise<void> {
    //transforma entidade em model para inserir no db
    //include inclui os relacionados na transacao
    await this.genreModel.create(GenreModelMapper.toModelProps(entity), {
      include: ['categories_id'], //incluir o array com categories_id
      transaction: this.uow.getTransaction(), //ativar o modo transacao
    });
  }

  async bulkInsert(entities: Genre[]): Promise<void> {
    const models = entities.map((e) => GenreModelMapper.toModelProps(e));
    await this.genreModel.bulkCreate(models, {
      include: ['categories_id'],
      transaction: this.uow.getTransaction(),
    });
  }

  async findById(id: GenreId): Promise<Genre | null> {
    const model = await this._get(id.id);
    return model ? GenreModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      include: ['categories_id'],
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => GenreModelMapper.toEntity(m));
  }

  async findByIds(ids: GenreId[]): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      where: {
        genre_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      include: ['categories_id'],
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => GenreModelMapper.toEntity(m));
  }

  //retorna os id de genre que existe e que nao existe
  async existsById(
    ids: GenreId[],
  ): Promise<{ exists: GenreId[]; not_exists: GenreId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsGenreModels = await this.genreModel.findAll({
      attributes: ['genre_id'],
      where: {
        genre_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      transaction: this.uow.getTransaction(),
    });
    const existsGenreIds = existsGenreModels.map(
      (m) => new GenreId(m.genre_id),
    );
    const notExistsGenreIds = ids.filter(
      (id) => !existsGenreIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsGenreIds,
      not_exists: notExistsGenreIds,
    };
  }

  async update(aggregate: Genre): Promise<void> {
    const model = await this._get(aggregate.genre_id.id);

    if (!model) {
      throw new NotFoundError(aggregate.genre_id.id, this.getEntity());
    }

    //remove todos registros relacionados na tabela pivo
    await model.$remove(
      'categories',
      model.categories_id.map((c) => c.category_id),
      {
        transaction: this.uow.getTransaction(),
      },
    );
    const { categories_id, ...props } =
      GenreModelMapper.toModelProps(aggregate);
    await this.genreModel.update(props, {
      where: { genre_id: aggregate.genre_id.id },
      transaction: this.uow.getTransaction(),
    });
    await model.$add(
      'categories',
      categories_id.map((c) => c.category_id),
      {
        transaction: this.uow.getTransaction(),
      },
    );
  }

  async delete(id: GenreId): Promise<void> {
    const genreCategoryRelation =
      this.genreModel.associations.categories_id.target;
    //destroi primeiro os relacionados co genre
    await genreCategoryRelation.destroy({
      where: { genre_id: id.id },
      transaction: this.uow.getTransaction(),
    });
    //destruir o genre
    const affectedRows = await this.genreModel.destroy({
      where: { genre_id: id.id },
      transaction: this.uow.getTransaction(),
    });

    //verificar o numero de linha afetadas, se for 0 retorna erro
    if (affectedRows !== 1) {
      throw new NotFoundError(id.id, this.getEntity());
    }
  }

  private async _get(id: string): Promise<GenreModel | null> {
    return this.genreModel.findByPk(id, {
      // pega o GenreCategoryModel e nao CategoryModel, para melhorar a performance, retorna somente o id da categoria
      include: ['categories_id'],
      transaction: this.uow.getTransaction(),
    });
  }

  async search(props: GenreSearchParams): Promise<GenreSearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;
    // instancia do model da tabela pivo entre category_id e genre_id
    const genreCategoryRelation =
      this.genreModel.associations.categories_id.target;
    //pegar o nome da tabela de genre
    const genreTableName = this.genreModel.getTableName();
    //pegar o nome da tabela de category
    const genreCategoryTableName = genreCategoryRelation.getTableName();
    //alias para usar no sql
    const genreAlias = this.genreModel.name;

    // where query builder, where tambem sera utilizado como raw
    const wheres: any[] = [];

    if (props.filter && (props.filter.name || props.filter.categories_id)) {
      //verificar se existe filtro por name
      if (props.filter.name) {
        wheres.push({
          field: 'name',
          value: `%${props.filter.name}%`,
          get condition() {
            return {
              [this.field]: {
                [Op.like]: this.value,
              },
            };
          },
          // parametro de consulta do sql
          rawCondition: `${genreAlias}.name LIKE :name`,
        });
      }

      if (props.filter.categories_id) {
        //verificar se existe filtro por name
        wheres.push({
          field: 'categories_id',
          value: props.filter.categories_id.map((c) => c.id),
          get condition() {
            return {
              ['$categories_id.category_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          // parametro  de consulta do sql
          rawCondition: `${genreCategoryTableName}.category_id IN (:categories_id)`,
        });
      }
    }

    const orderBy =
      props.sort && this.sortableFields.includes(props.sort)
        ? this.formatSort(props.sort, props.sort_dir!)
        : `${genreAlias}.\`created_at\` DESC`;

    //@ts-expect-error  - count is a number
    const count: number = await this.genreModel.count({
      //distintict na query para retornar as associacoes
      distinct: true,
      //verificar se existe alguma coisa no props.filter?.categories_id
      //filtro com a tabela pivo, include = categories_id ou []
      //@ts-expect-error - add include only if categories_id is defined
      include: [props.filter?.categories_id && 'categories_id'].filter(
        (i) => i,
      ),
      where: wheres.length ? { [Op.and]: wheres.map((w) => w.condition) } : {},
      transaction: this.uow.getTransaction(),
    });

    const columnOrder = orderBy.replace('binary', '').trim().split(' ')[0];

    //query que gera os index que tera o id dos genres, que serao selecionados depois e,
    // created_at ou a coluna que se quer ordenao
    const query = [
      'SELECT',
      `DISTINCT ${genreAlias}.\`genre_id\`,${columnOrder} FROM ${genreTableName} as ${genreAlias}`,
      //caso no filtro possua categories_id realiza join entre as tabelas genres e categories
      props.filter?.categories_id
        ? `INNER JOIN ${genreCategoryTableName} ON ${genreAlias}.\`genre_id\` = ${genreCategoryTableName}.\`genre_id\``
        : '',
      //verificar se where possui algun valor
      wheres.length
        ? `WHERE ${wheres.map((w) => w.rawCondition).join(' AND ')}` //query
        : '',
      `ORDER BY ${orderBy}`,
      `LIMIT ${limit}`,
      `OFFSET ${offset}`,
    ];

    // selecao do generos que se quer
    const [idsResult] = await this.genreModel.sequelize!.query(
      query.join(' '),
      {
        replacements: wheres.reduce(
          (acc, w) => ({ ...acc, [w.field]: w.value }),
          {},
        ),
        transaction: this.uow.getTransaction(),
      },
    );

    //selecionar com todos campos que se precisa(category_id)
    const models = await this.genreModel.findAll({
      where: {
        genre_id: {
          [Op.in]: idsResult.map(
            (id: { genre_id: string }) => id.genre_id,
          ) as string[],
        },
      },
      include: ['categories_id'],
      order: literal(orderBy),
      transaction: this.uow.getTransaction(),
    });

    return new GenreSearchResult({
      items: models.map((m) => GenreModelMapper.toEntity(m)),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.genreModel.sequelize!.getDialect();
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return `${this.genreModel.name}.\`${sort}\` ${sort_dir}`;
  }

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }
}
