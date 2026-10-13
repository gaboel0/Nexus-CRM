import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { PROJECT_STATUS_TONE } from '../../../../core/models/project.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ProjectDataService } from '../../../../core/services/project-data.service';
import {
  APP_NAV_ITEMS,
  Badge,
  Card,
  ProgressBar,
  Sidebar,
  Skeleton,
  TextLink,
} from '../../../../shared';
import { buildProjectDetail } from '../../project-detail';

/**
 * Página de um projeto (`/projetos/:id`): status, descrição, líder, datas, andamento e tarefas.
 * Os dados vêm do `ProjectDataService`; a montagem, de `project-detail.ts`.
 */
@Component({
  selector: 'app-project-detail-page',
  imports: [DatePipe, Badge, Card, ProgressBar, Sidebar, Skeleton, TextLink],
  templateUrl: './project-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly data = inject(ProjectDataService);

  protected readonly user = this.auth.currentUser;
  protected readonly navItems = APP_NAV_ITEMS;
  protected readonly statusTone = PROJECT_STATUS_TONE;
  /** Data de referência para atrasos, fixada ao abrir a tela. */
  private readonly today = new Date();

  private readonly projectId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => Number(params.get('id')))),
    { requireSync: true },
  );

  // Sem valor inicial: `undefined` quer dizer "resposta ainda não chegou".
  private readonly projectsResponse = toSignal(this.data.getProjects());
  private readonly tasksResponse = toSignal(this.data.getTasks());
  private readonly teamResponse = toSignal(this.data.getTeam());

  /** Carregando enquanto qualquer uma das respostas não chegou. A tela mostra skeletons. */
  protected readonly loading = computed(
    () =>
      this.projectsResponse() === undefined ||
      this.tasksResponse() === undefined ||
      this.teamResponse() === undefined,
  );

  /** `null` quando o projeto do endereço não existe. */
  protected readonly detail = computed(() =>
    buildProjectDetail(
      this.projectId(),
      this.projectsResponse() ?? [],
      this.tasksResponse() ?? [],
      this.teamResponse() ?? [],
      this.today,
    ),
  );

  protected readonly infoPlaceholders = [1, 2, 3];
  protected readonly rowPlaceholders = [1, 2, 3, 4];

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
