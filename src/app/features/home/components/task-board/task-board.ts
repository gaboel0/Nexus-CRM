import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import { TaskStatus } from '../../../../core/models/project.models';
import { BoardColumn, BoardTask } from '../../dashboard-stats';
import { TaskCard } from '../task-card/task-card';

/** Pedido de mudança de status, emitido ao soltar uma tarefa em outra coluna. */
export interface TaskMove {
  readonly taskId: number;
  readonly status: TaskStatus;
}

/**
 * Quadro de tarefas em colunas (A fazer → Concluídas). Ocupa a altura do contêiner: cada coluna
 * rola na vertical e o quadro rola na horizontal quando não há largura para todas.
 *
 * As tarefas podem ser arrastadas entre colunas (drag and drop nativo) ou movidas pelo teclado com
 * as setas ← e → no cartão focado. Clique, Enter ou Espaço emitem `taskOpened` para a página
 * mostrar os detalhes. O quadro não altera dados: emite `taskMoved` e a página atualiza as colunas.
 */
@Component({
  selector: 'app-task-board',
  imports: [TaskCard],
  templateUrl: './task-board.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class TaskBoard {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly columns = input.required<readonly BoardColumn[]>();
  readonly taskMoved = output<TaskMove>();
  /** Id da tarefa clicada (ou acionada com Enter/Espaço). */
  readonly taskOpened = output<number>();

  /** Tarefa sendo arrastada e coluna sob o ponteiro (para o destaque visual). */
  protected readonly draggingId = signal<number | null>(null);
  protected readonly dropTarget = signal<TaskStatus | null>(null);
  /** Texto lido pelo leitor de tela depois de uma mudança. */
  protected readonly announcement = signal('');

  protected onDragStart(event: DragEvent, task: BoardTask): void {
    this.draggingId.set(task.id);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(task.id));
    }
  }

  protected onDragEnd(): void {
    this.draggingId.set(null);
    this.dropTarget.set(null);
  }

  protected onDragOver(event: DragEvent, status: TaskStatus): void {
    if (this.draggingId() === null) {
      return;
    }
    // preventDefault libera o drop nesta coluna.
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dropTarget.set(status);
  }

  protected onDragLeave(event: DragEvent, status: TaskStatus): void {
    const target = event.currentTarget as HTMLElement;
    // Ignora a saída para um elemento filho da própria coluna.
    if (!target.contains(event.relatedTarget as Node | null) && this.dropTarget() === status) {
      this.dropTarget.set(null);
    }
  }

  protected onDrop(event: DragEvent, column: BoardColumn): void {
    event.preventDefault();
    const taskId = this.draggingId();
    this.onDragEnd();
    if (taskId !== null) {
      this.move(taskId, column);
    }
  }

  /**
   * Enter e Espaço abrem os detalhes. ← e → levam a tarefa focada para a coluna vizinha e mantêm
   * o foco nela.
   */
  protected onKeydown(event: KeyboardEvent, task: BoardTask, columnIndex: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.taskOpened.emit(task.id);
      return;
    }
    const step = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
    const target = this.columns()[columnIndex + step];
    if (!step || !target) {
      return;
    }
    event.preventDefault();
    this.move(task.id, target);
    afterNextRender(
      () =>
        this.host.nativeElement.querySelector<HTMLElement>(`[data-task-id="${task.id}"]`)?.focus(),
      { injector: this.injector },
    );
  }

  private move(taskId: number, column: BoardColumn): void {
    const current = this.columns().find((c) => c.tasks.some((task) => task.id === taskId));
    const task = current?.tasks.find((t) => t.id === taskId);
    if (!current || !task || current.status === column.status) {
      return;
    }
    this.taskMoved.emit({ taskId, status: column.status });
    this.announcement.set(`${task.title} movida para ${column.label}.`);
  }
}
