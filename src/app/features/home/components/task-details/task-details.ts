import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../../../../shared';
import { BoardTask } from '../../dashboard-stats';
import { PRIORITY_CLASSES } from '../task-card/task-card';

/**
 * Detalhes de uma tarefa do quadro: descrição completa, status, prioridade, prazo, conclusão e
 * responsável. Exibido dentro do `app-modal`, que traz o título e o botão de fechar.
 */
@Component({
  selector: 'app-task-details',
  imports: [DatePipe, Icon],
  templateUrl: './task-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetails {
  readonly task = input.required<BoardTask>();

  protected readonly priorityClass = computed(() => PRIORITY_CLASSES[this.task().priority]);
}
