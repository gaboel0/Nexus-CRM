import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskComment } from '../../../../core/models/project.models';
import { Button, Skeleton, Textarea } from '../../../../shared';
import { initials } from '../../dashboard-stats';

export const COMMENT_MAX_LENGTH = 1000;

/**
 * Discussão de uma tarefa: lista de comentários e campo para escrever um novo. Não acessa dados:
 * emite `commentSubmitted` com o texto, e a página grava e chama `reset()` quando der certo.
 */
@Component({
  selector: 'app-task-comments',
  imports: [DatePipe, ReactiveFormsModule, Button, Skeleton, Textarea],
  templateUrl: './task-comments.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskComments {
  /** `undefined` enquanto os comentários carregam. */
  readonly comments = input.required<readonly TaskComment[] | undefined>();
  readonly posting = input(false);
  readonly commentSubmitted = output<string>();

  protected readonly maxLength = COMMENT_MAX_LENGTH;
  protected readonly form = inject(NonNullableFormBuilder).group({
    content: ['', [Validators.required, Validators.maxLength(COMMENT_MAX_LENGTH)]],
  });
  /** Erro só aparece depois de uma tentativa de envio, para não acusar o campo vazio ao abrir. */
  protected readonly error = signal<string | null>(null);

  protected readonly count = computed(() => this.comments()?.length ?? 0);

  protected initials(name: string): string {
    return initials(name);
  }

  protected submit(): void {
    const content = this.form.controls.content.value.trim();
    if (!content) {
      this.error.set('Escreva um comentário antes de enviar.');
      return;
    }
    if (this.form.invalid) {
      this.error.set(`O comentário pode ter até ${COMMENT_MAX_LENGTH} caracteres.`);
      return;
    }
    this.error.set(null);
    this.commentSubmitted.emit(content);
  }

  /** Limpa o campo depois que o comentário foi gravado. */
  reset(): void {
    this.form.reset();
    this.error.set(null);
  }
}
