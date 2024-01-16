import { Exclude, Expose } from 'class-transformer';
import {
  PaginationPresenter,
  PaginationPresenterProps,
} from './pagination.presenter';

export abstract class CollectionPresenter {
  //exclude evita que PaginationPresenter seje serializado para gerar a resposta http
  @Exclude()
  //PaginationPresenter faz a validacao e transformacao dos valores recebidos
  protected paginationPresenter: PaginationPresenter;

  constructor(props: PaginationPresenterProps) {
    this.paginationPresenter = new PaginationPresenter(props);
  }

  //transforma PaginationPresenter em meta na resposta serializada
  @Expose({ name: 'meta' })
  get meta() {
    return this.paginationPresenter;
  }

  abstract get data();
}
