import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

/** Rotas privadas do dashboard. Exigem usuário logado. */
export const HOME_ROUTES: Routes = [
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage),
  },
];
