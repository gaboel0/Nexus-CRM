import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { PROJECT_STATUS_TONE } from '../../../../core/models/project.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ProjectDataService } from '../../../../core/services/project-data.service';
import { APP_NAV_ITEMS, Badge, Card, ProgressBar, Sidebar, Skeleton } from '../../../../shared';
import { buildProjectGroups } from '../../project-list';

/**
 * Listagem de projetos (`/projetos`): um grid de cartões por equipe. Cada cartão leva à página do
 * projeto. Os dados vêm do `ProjectDataService`; o agrupamento, de `project-list.ts`.
 */
@Component({
  selector: 'app-project-list-page',
  imports: [DatePipe, RouterLink, Badge, Card, ProgressBar, Sidebar, Skeleton],
  templateUrl: './project-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly data = inject(ProjectDataService);

  protected readonly user = this.auth.currentUser;
  protected readonly navItems = APP_NAV_ITEMS;
  protected readonly statusTone = PROJECT_STATUS_TONE;

  // Sem valor inicial: `undefined` quer dizer "resposta ainda não chegou".
  private readonly teamsResponse = toSignal(this.data.getProjectTeams());
  private readonly projectsResponse = toSignal(this.data.getProjects());
  private readonly tasksResponse = toSignal(this.data.getTasks());
  private readonly membersResponse = toSignal(this.data.getTeam());

  /** Carregando enquanto qualquer uma das respostas não chegou. A tela mostra skeletons. */
  protected readonly loading = computed(
    () =>
      this.teamsResponse() === undefined ||
      this.projectsResponse() === undefined ||
      this.tasksResponse() === undefined ||
      this.membersResponse() === undefined,
  );

  protected readonly groups = computed(() =>
    buildProjectGroups(
      this.teamsResponse() ?? [],
      this.projectsResponse() ?? [],
      this.tasksResponse() ?? [],
      this.membersResponse() ?? [],
    ),
  );
  protected readonly totalProjects = computed(() => this.projectsResponse()?.length ?? 0);

  /** Quantidade de blocos de skeleton, no formato do conteúdo real. */
  protected readonly groupPlaceholders = [1, 2];
  protected readonly cardPlaceholders = [1, 2, 3];

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
