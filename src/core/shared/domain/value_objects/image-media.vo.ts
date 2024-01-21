import { ValueObject } from '../value_object';

export abstract class ImageMedia extends ValueObject {
  readonly name: string;
  readonly location: string;

  constructor({ name, location }: { name: string; location: string }) {
    super();
    this.name = name;
    this.location = location;
  }

  get url(): string {
    return `${this.location}/${this.name}`;
  }

  toJson() {
    return {
      name: this.name,
      location: this.location,
    };
  }
}
