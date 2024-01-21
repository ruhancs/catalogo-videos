import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import {
  ICastMemberRepository,
  CastMemberFilter,
} from '@core/cast-member/domain/cast-member.repository';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { InMemorySearchableRepository } from '@core/shared/infra/db/in-memory/in-memory.repository';

export class CastMemberInMemoryRepository
  extends InMemorySearchableRepository<
    CastMember,
    CastMemberId,
    CastMemberFilter
  >
  implements ICastMemberRepository
{
  findByIds(ids: CastMemberId[]): Promise<CastMember[]> {
    throw new Error('Method not implemented.');
  }
  existsById(ids: CastMemberId[]): Promise<{ exists: CastMemberId[]; not_exists: CastMemberId[]; }> {
    throw new Error('Method not implemented.');
  }
  sortableFields: string[] = ['name', 'created_at'];
  //filtro de cast-member nao é uma string e sim um objeto, posivel utilizar name e type
  protected async applyFilter(
    items: CastMember[],
    filter: CastMemberFilter | null,
  ): Promise<CastMember[]> {
    if (!filter) {
      return items;
    }

    return items.filter((i) => {
      //se filter.name nao for nulo
      //retorna expressao para encontrar items com o mesmo nome
      const containsName =
        filter.name && i.name.toLowerCase().includes(filter.name.toLowerCase());
      //se filter.type nao for nulo
      //retorna expressao para verificar os tipos que sao iguais
      const hasType = filter.type && i.type.equals(filter.type);
      return filter.name && filter.type
        ? containsName && hasType
        : filter.name
          ? containsName
          : hasType;
    });
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }
  protected applySort(
    items: CastMember[],
    sort: string,
    sort_dir: SortDirection,
  ): CastMember[] {
    return sort
      ? super.applySort(items, sort, sort_dir)
      : super.applySort(items, 'created_at', 'desc'); //se nao for aplicado sort ordena por ordem decrescente de criacao
  }
}
