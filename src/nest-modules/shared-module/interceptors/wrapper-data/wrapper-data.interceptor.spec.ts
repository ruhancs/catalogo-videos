import { lastValueFrom, of } from 'rxjs';
import { WrapperDataInterceptor } from './wrapper-data.interceptor';

describe('WrapperDataInterceptor', () => {
  let interceptor: WrapperDataInterceptor;

  beforeEach(() => {
    interceptor = new WrapperDataInterceptor();
  });
  it('should wrapper with data key', async () => {
    expect(interceptor).toBeDefined();
    //observable é instanciado na memoria e captura novos fluxos
    const obs$ = interceptor.intercept({} as any, {
      //handle recebe um observable, simula saida do controller
      handle: () => of({ name: 'test' }),
    });
    //lastValueFrom permite que converta o observable para promisse
    const result = await lastValueFrom(obs$);
    expect(result).toEqual({ data: { name: 'test' } });
  });

  it('should not wrapper when metadata key is present', async () => {
    expect(interceptor).toBeDefined();
    const data = { data: { name: 'test' }, meta: { total: 1 } };
    //observable é instanciado na memoria e captura novos fluxos
    const obs$ = interceptor.intercept({} as any, {
      //handle recebe um observable, simula saida do controller
      handle: () => of(data),
    });
    //lastValueFrom permite que converta o observable para promisse
    const result = await lastValueFrom(obs$);
    expect(result).toEqual({ data: { name: 'test' }, meta: { total: 1 } });
  });
});
