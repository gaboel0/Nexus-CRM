import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TaskPriority } from '../../../../core/models/project.models';
import { Icon } from '../../../../shared';
import { BoardTask } from '../../dashboard-stats';

/** Cor do selo de prioridade. O texto (alta, média, baixa) sempre acompanha a cor. */
export const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  alta: 'bg-crm-error/10 text-crm-error',
  média: 'bg-crm-primary/10 text-crm-link',
  baixa: 'bg-crm-canvas text-crm-muted',
};

/** Conteúdo de uma tarefa no quadro: título, projeto, prioridade, prazo e responsável. */
@Component({
  selector: 'app-task-card',
  imports: [DatePipe, Icon],
  templateUrl: './task-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCard {
  readonly task = input.required<BoardTask>();

  protected priorityClass(priority: TaskPriority): string {
    return PRIORITY_CLASSES[priority];
  }
}
