import {
  CastMemberType,
  CastMemberTypes,
  InvalidCastMemberTypeError,
} from '../cast-member-type.vo';

describe('CastMemberType Unit Tests', () => {
  const validateSpy = jest.spyOn(CastMemberType.prototype, 'validate' as any);
  test('invalid type', () => {
    const [vo, err] = CastMemberType.create('1' as any);
    expect(vo).toEqual(null);
    expect(err).toEqual(new InvalidCastMemberTypeError('1'));
    expect(validateSpy).toHaveBeenCalledTimes(1);
  });

  test('create a actor', () => {
    const actor = CastMemberType.createAnActor();
    expect(actor.type).toEqual(CastMemberTypes.ACTOR);
    expect(validateSpy).toHaveBeenCalledTimes(1);

    const [actor2, err] = CastMemberType.create(
      CastMemberTypes.ACTOR,
    ).asArray();
    expect(err).toBeNull();
    expect(actor2.type).toBe(CastMemberTypes.ACTOR);
    expect(validateSpy).toHaveBeenCalledTimes(2);
  });

  test('create a director', () => {
    const director = CastMemberType.createADirector();
    expect(director.type).toEqual(CastMemberTypes.DIRECTOR);
    expect(validateSpy).toHaveBeenCalledTimes(1);

    const [director2, err] = CastMemberType.create(
      CastMemberTypes.DIRECTOR,
    ).asArray();
    expect(err).toBeNull();
    expect(director2.type).toBe(CastMemberTypes.DIRECTOR);
    expect(validateSpy).toHaveBeenCalledTimes(2);
  });
});
