import { CastMembersIdExistsInDatabaseValidator } from '../../../../cast-member/application/validations/cast-members-ids-exists-in-database.validator';
import { CategoriesIdExistsInDatabaseValidator } from '../../../../category/application/validations/categories-ids-exists-in-database.validator';
import { GenresIdExistsInDatabaseValidator } from '../../../../genre/application/validations/genres-ids-exists-in-database.validator';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { IUnitOfWork } from '../../../../shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '../../../../shared/domain/validators/validation_error';
import { Rating } from '../../../domain/rating.vo';
import { Video } from '../../../domain/video.aggregate';
import { IVideoRepository } from '../../../domain/video.repository';
import { CreateVideoInput } from './create-video.input';

export class CreateVideoUseCase
  implements IUseCase<CreateVideoInput, CreateVideoOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
    private genresIdValidator: GenresIdExistsInDatabaseValidator,
    private castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
  ) {}

  async execute(input: CreateVideoInput): Promise<CreateVideoOutput> {
    //criar value obj Rating atraves do input, e verificar se o input de rating é valido
    const [rating, errorRating] = Rating.create(input.rating).asArray();

    //verificar se os ids de category, genre e cast member ja estao criados no db
    const [eitherCategoriesId, eitherGenresId, eitherCastMembers] =
      //resolver todas promessas juntas, pois uma nao depende da outra
      await Promise.all([
        await this.categoriesIdValidator.validate(input.categories_id),
        await this.genresIdValidator.validate(input.genres_id),
        await this.castMembersIdValidator.validate(input.cast_members_id),
      ]);

    //verificar se algun id de category, genre e cast member nao existe no db
    const [categoriesId, errorsCategoriesId] = eitherCategoriesId.asArray();
    const [genresId, errorsGenresId] = eitherGenresId.asArray();
    const [castMembersId, errorsCastMembersId] = eitherCastMembers.asArray();

    //criar o agregado de video
    const video = Video.create({
      ...input,
      rating,
      categories_id: errorsCategoriesId ? [] : categoriesId, //se tiver erro inseri array vazio
      genres_id: errorsGenresId ? [] : genresId,
      cast_members_id: errorsCastMembersId ? [] : castMembersId,
    });

    //pegar instancia de notification de erros do agregado de video
    const notification = video.notification;

    //verificar erros de id que nao existe no db
    if (errorsCategoriesId) {
      //inserir no notification de video, erro se o id nao existir
      notification.setError(
        errorsCategoriesId.map((e) => e.message),
        'categories_id',
      );
    }

    if (errorsGenresId) {
      notification.setError(
        errorsGenresId.map((e) => e.message),
        'genres_id',
      );
    }

    if (errorsCastMembersId) {
      notification.setError(
        errorsCastMembersId.map((e) => e.message),
        'cast_members_id',
      );
    }

    //verificar se aconteceu erro ao cria vo Rating
    if (errorRating) {
      //inserir o erro em notification
      notification.setError(errorRating.message, 'rating');
    }

    //verificar se existe algum erro em notification
    if (notification.hasErrors()) {
      //se tiver erros em notification retorna erro de validacao para o usuario
      throw new EntityValidationError(notification.toJSON());
    }

    //iniciar transacao de criacao de agregado de video
    await this.uow.do(async () => {
      //inserir video no db
      return this.videoRepo.insert(video);
    });

    return { id: video.video_id.id };
  }
}

export type CreateVideoOutput = { id: string };
