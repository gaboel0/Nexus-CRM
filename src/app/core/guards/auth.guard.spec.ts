import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AUTH_STORAGE_KEY } from '../services/auth.service';
import { authGuard } from './auth.guard';

const SAVED_USER = { id: 2, name: 'Ana Souza', email: 'ana@crm.com', role: 'vendedor' };

/** Caminho para o qual o guard redireciona, ou `null` quando a rota é liberada. */
function redirectOf(result: unknown): string | null {
  return result instanceof UrlTree ? TestBed.inject(Router).serializeUrl(result) : null;
}

describe('authGuard', () => {
  const run = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  it('libera a rota quando há usuário logado', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(SAVED_USER));

    expect(run()).toBe(true);
  });

  it('redireciona para /login quando não há usuário logado', () => {
    expect(redirectOf(run())).toBe('/login');
  });
});
