import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

/** Rotas privadas de projetos: listagem e página de cada projeto. Exigem usuário logado. */
export const PROJECTS_ROUTES: Routes = [
  {
    path: 'projetos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/project-list-page/project-list-page').then((m) => m.ProjectListPage),
  },
  {
    path: 'projetos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/project-detail-page/project-detail-page').then((m) => m.ProjectDetailPage),
  },
];
