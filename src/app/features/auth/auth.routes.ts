import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest.guard';

/** Rotas públicas de autenticação. Só usuários não logados podem acessá-las. */
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth-page/auth-page').then((m) => m.AuthPage),
  },
];
