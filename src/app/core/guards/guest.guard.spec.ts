import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AUTH_STORAGE_KEY } from '../services/auth.service';
import { guestGuard } from './guest.guard';

const SAVED_USER = { id: 2, name: 'Ana Souza', email: 'ana@crm.com', role: 'vendedor' };

/** Caminho para o qual o guard redireciona, ou `null` quando a rota é liberada. */
function redirectOf(result: unknown): string | null {
  return result instanceof UrlTree ? TestBed.inject(Router).serializeUrl(result) : null;
}

describe('guestGuard', () => {
  const run = () =>
    TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  it('libera a tela de login quando não há usuário logado', () => {
    expect(run()).toBe(true);
  });

  it('redireciona usuário logado para /home', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(SAVED_USER));

    expect(redirectOf(run())).toBe('/home');
  });
});
