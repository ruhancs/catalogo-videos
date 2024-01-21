import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberInMemoryRepository } from '../cast-member-in-memory.repository';
import {
  CastMemberType,
  CastMemberTypes,
} from '@core/cast-member/domain/cast-member-type.vo';

describe('CastMemberInMemoryRepository Unit Tests', () => {
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => (repository = new CastMemberInMemoryRepository()));

  it('should return all item when filter is not applied', async () => {
    const items = CastMember.fake().theCastMembers(3).build();
    const filterSpy = jest.spyOn(items, 'filter' as any);
    const itemsFiltered = await repository['applyFilter'](items, null);
    expect(filterSpy).not.toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual(items);
  });

  it('should filter the cast-members', async () => {
    const faker = CastMember.fake().anActor();
    const director = CastMember.fake().aDirector().withName('D1').build();
    const items = [
      faker.withName('test').build(),
      faker.withName('Test').build(),
      faker.withName('other').build(),
      director,
    ];

    const filterSpy = jest.spyOn(items, 'filter' as any);
    let itemsFiltered = await repository['applyFilter'](items, {
      name: 'test',
    });
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[0], items[1]]);

    itemsFiltered = await repository['applyFilter'](items, {
      type: new CastMemberType(CastMemberTypes.DIRECTOR),
    });
    expect(filterSpy).toHaveBeenCalledTimes(2);
    expect(itemsFiltered).toStrictEqual([items[3]]);
  });

  it('should sort the item', async () => {
    const faker = CastMember.fake().anActor();
    const items = [
      faker.withName('c').build(),
      faker.withName('b').build(),
      faker.withName('a').build(),
    ];

    const itemsSorted = await repository['applySort'](items, 'name', 'asc');
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
  });
});
