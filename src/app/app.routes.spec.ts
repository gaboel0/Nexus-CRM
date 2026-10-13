import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { routes } from './app.routes';

function routeFor(path: string) {
  const route = routes.find((r) => r.path === path);
  if (!route) {
    throw new Error(`Rota "${path}" não encontrada`);
  }
  return route;
}

describe('routes', () => {
  it('mantém os caminhos e a ordem: raiz, login, home, projetos e curinga', () => {
    expect(routes.map((r) => r.path)).toEqual([
      '',
      'login',
      'home',
      'projetos',
      'projetos/:id',
      '**',
    ]);
  });

  it('redireciona a raiz e os caminhos desconhecidos para /home', () => {
    expect(routeFor('').redirectTo).toBe('home');
    expect(routeFor('**').redirectTo).toBe('home');
  });

  it('protege /login contra usuários logados e /home contra visitantes', () => {
    expect(routeFor('login').canActivate).toEqual([guestGuard]);
    expect(routeFor('home').canActivate).toEqual([authGuard]);
    expect(routeFor('projetos').canActivate).toEqual([authGuard]);
    expect(routeFor('projetos/:id').canActivate).toEqual([authGuard]);
  });

  it('carrega as telas sob demanda (lazy)', () => {
    expect(routeFor('login').loadComponent).toBeDefined();
    expect(routeFor('home').loadComponent).toBeDefined();
    expect(routeFor('projetos').loadComponent).toBeDefined();
    expect(routeFor('projetos/:id').loadComponent).toBeDefined();
  });
});
