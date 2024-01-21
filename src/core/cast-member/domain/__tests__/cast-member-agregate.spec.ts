import { CastMember, CastMemberId } from '../cast-member.aggregate';
import { CastMemberType } from '../cast-member-type.vo';

describe('CastMember Unit Tests', () => {
  beforeEach(() => {
    CastMember.prototype.validate = jest
      .fn()
      .mockImplementation(CastMember.prototype.validate);
  });

  test('constructor of cast-member', () => {
    const director = CastMemberType.createADirector();
    let castMember = new CastMember({
      name: 'C1',
      type: director,
    });
    expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
    expect(castMember.name).toBe('C1');
    expect(castMember.type).toEqual(director);
    expect(castMember.created_at).toBeDefined();

    const created_at = new Date();
    const id = new CastMemberId();
    castMember = new CastMember({
      cast_member_id: id,
      name: 'C1',
      type: director,
      created_at,
    });

    expect(castMember.cast_member_id).toBe(id);
    expect(castMember.name).toBe('C1');
    expect(castMember.type).toEqual(director);
    expect(castMember.created_at).toEqual(created_at);
  });

  describe('id field', () => {
    const actor = CastMemberType.createADirector();
    const arrange = [
      { name: 'C1', type: actor },
      { name: 'C1', type: actor, id: null },
      { name: 'C1', type: actor, id: undefined },
      { name: 'C1', type: actor, id: new CastMemberId() },
    ];

    test.each(arrange)('when props is %j', (item) => {
      const castMember = new CastMember(item);
      expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
    });
  });

  describe('create command', () => {
    test('should create a cast member', () => {
      const actor = CastMemberType.createAnActor();
      const castMember = CastMember.create({
        name: 'test',
        type: actor,
      });
      expect(castMember.cast_member_id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('test');
      expect(castMember.type).toEqual(actor);
      expect(castMember.created_at).toBeInstanceOf(Date);
      expect(CastMember.prototype.validate).toHaveBeenCalledTimes(1);
      expect(castMember.notification.hasErrors()).toBe(false);
    });
  });
  describe('CastMember Validator', () => {
    describe('create command', () => {
      test('should an invalid cast member with name property', () => {
        const castMember = CastMember.create({ name: 't'.repeat(256) } as any);
        expect(castMember.notification.hasErrors()).toBe(true);
        expect(castMember.notification).notificationContainsErrorMessages([
          {
            name: ['name must be shorter than or equal to 255 characters'],
          },
        ]);
      });
    });
  });
});
