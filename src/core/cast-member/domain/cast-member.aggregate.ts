import { ValueObject } from '@core/shared/domain/value_object';
import { AggregateRoot } from '../../shared/domain/aggregate-root';
import { Uuid } from '../../shared/domain/value_objects/uuid.vo';
import { CastMemberValidatorFactory } from './cast-member.validator';
import { CastMemberType } from './cast-member-type.vo';
import { CastMemberFakeBuilder } from './cast-member-fake.builder';

export class CastMemberId extends Uuid {}

export type CastMemberConstructorProps = {
  cast_member_id?: CastMemberId;
  name: string;
  type: CastMemberType;
  created_at?: Date;
};

export class CastMember extends AggregateRoot {
  cast_member_id: CastMemberId;
  name: string;
  type: CastMemberType;
  created_at: Date;
  constructor(props: CastMemberConstructorProps) {
    super();
    this.cast_member_id = props.cast_member_id ?? new CastMemberId();
    this.name = props.name;
    this.type = props.type;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: CastMemberConstructorProps) {
    const castMember = new CastMember(props);
    castMember.validate(['name']);
    return castMember;
  }

  validate(fields?: string[]) {
    const validator = CastMemberValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return CastMemberFakeBuilder;
  }

  get entity_id(): ValueObject {
    return this.cast_member_id;
  }

  toJSON() {
    return {
      cast_member_id: this.cast_member_id.id,
      name: this.name,
      type: this.type.type,
      created_at: this.created_at,
    };
  }
}
