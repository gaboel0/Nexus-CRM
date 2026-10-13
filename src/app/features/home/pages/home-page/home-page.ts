import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { concat, of, switchMap } from 'rxjs';
import { PROJECT_STATUS_TONE } from '../../../../core/models/project.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ProjectDataService } from '../../../../core/services/project-data.service';
import {
  APP_NAV_ITEMS,
  Badge,
  Card,
  Modal,
  ProgressBar,
  Sidebar,
  Skeleton,
} from '../../../../shared';
import { TaskBoard, TaskMove } from '../../components/task-board/task-board';
import { TaskComments } from '../../components/task-comments/task-comments';
import { TaskDetails } from '../../components/task-details/task-details';
import {
  buildDashboardStats,
  buildProjectSummaries,
  buildTaskBoard,
  buildTeamWorkload,
  moveTask,
} from '../../dashboard-stats';

/**
 * Visão geral dos projetos e das atividades do time, em tela cheia. Os dados vêm do
 * `ProjectDataService`; indicadores, quadro, andamento e carga da equipe, de `dashboard-stats.ts`.
 */
@Component({
  selector: 'app-home-page',
  imports: [
    DatePipe,
    RouterLink,
    Badge,
    Card,
    Modal,
    ProgressBar,
    Sidebar,
    Skeleton,
    TaskBoard,
    TaskComments,
    TaskDetails,
  ],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly data = inject(ProjectDataService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly user = this.auth.currentUser;
  protected readonly navItems = APP_NAV_ITEMS;
  protected readonly statusTone = PROJECT_STATUS_TONE;
  /** Data de referência para prazos e atrasos, fixada ao abrir a tela. */
  protected readonly today = new Date();

  // Sem valor inicial: `undefined` quer dizer "resposta ainda não chegou". Lista vazia é resposta
  // válida e não deixa a tela presa no carregamento.
  private readonly projectsResponse = toSignal(this.data.getProjects());
  private readonly tasksResponse = toSignal(this.data.getTasks());
  private readonly teamResponse = toSignal(this.data.getTeam());

  private readonly projects = computed(() => this.projectsResponse() ?? []);
  /**
   * Tarefas exibidas: partem da resposta do serviço e recebem as mudanças de status feitas no
   * quadro. As mudanças ficam só na tela (os dados são mocks, sem persistência).
   */
  private readonly tasks = linkedSignal(() => this.tasksResponse() ?? []);
  private readonly team = computed(() => this.teamResponse() ?? []);

  /** Carregando enquanto qualquer uma das respostas não chegou. A tela mostra skeletons. */
  protected readonly loading = computed(
    () =>
      this.projectsResponse() === undefined ||
      this.tasksResponse() === undefined ||
      this.teamResponse() === undefined,
  );

  /** Quantidade de blocos de skeleton, no formato do conteúdo real. */
  protected readonly kpiPlaceholders = [1, 2, 3, 4];
  protected readonly columnPlaceholders = [1, 2, 3, 4];
  protected readonly rowPlaceholders = [1, 2, 3];

  protected readonly stats = computed(() =>
    buildDashboardStats(this.projects(), this.tasks(), this.today),
  );
  protected readonly board = computed(() =>
    buildTaskBoard(this.tasks(), this.projects(), this.team(), this.today),
  );
  /** Tarefa aberta no modal de detalhes. Lida do quadro, acompanha mudanças de status. */
  private readonly selectedTaskId = signal<number | null>(null);
  protected readonly selectedTask = computed(() => {
    const id = this.selectedTaskId();
    return this.board()
      .flatMap((column) => column.tasks)
      .find((task) => task.id === id);
  });
  /**
   * Comentários da tarefa aberta. `undefined` enquanto carregam (a cada troca de tarefa); os
   * comentários enviados entram na lista sem recarregar.
   */
  private readonly commentsResponse = toSignal(
    toObservable(this.selectedTaskId).pipe(
      switchMap((id) =>
        id === null ? of(undefined) : concat(of(undefined), this.data.getTaskComments(id)),
      ),
    ),
  );
  protected readonly comments = linkedSignal(() => this.commentsResponse());
  protected readonly postingComment = signal(false);
  private readonly commentsPanel = viewChild(TaskComments);

  protected readonly projectSummaries = computed(() =>
    buildProjectSummaries(this.projects(), this.tasks()),
  );
  protected readonly workload = computed(() =>
    buildTeamWorkload(this.team(), this.tasks(), this.today),
  );

  /** Aplica a mudança de status vinda do quadro; indicadores e andamento recalculam sozinhos. */
  protected moveTask({ taskId, status }: TaskMove): void {
    this.tasks.update((tasks) => moveTask(tasks, taskId, status, this.today));
  }

  protected openTask(taskId: number): void {
    this.selectedTaskId.set(taskId);
  }

  protected closeTask(): void {
    this.selectedTaskId.set(null);
  }

  protected addComment(content: string): void {
    const taskId = this.selectedTaskId();
    const author = this.user()?.name;
    if (taskId === null || !author) {
      return;
    }
    this.postingComment.set(true);
    this.data
      .addTaskComment(taskId, author, content)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((comment) => {
        this.postingComment.set(false);
        // A tarefa pode ter sido fechada ou trocada durante o envio.
        if (this.selectedTaskId() === comment.taskId) {
          this.comments.update((list) => [...(list ?? []), comment]);
          this.commentsPanel()?.reset();
        }
      });
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
