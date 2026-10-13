import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { HOME_ROUTES } from './features/home/home.routes';
import { PROJECTS_ROUTES } from './features/projects/projects.routes';

/** Composição das rotas. Cada feature declara as próprias rotas no seu `*.routes.ts`. */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  ...AUTH_ROUTES,
  ...HOME_ROUTES,
  ...PROJECTS_ROUTES,
  { path: '**', redirectTo: 'home' },
];
