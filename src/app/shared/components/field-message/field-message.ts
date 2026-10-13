import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Mensagem abaixo de um campo: erro, sucesso ou ajuda (nesta ordem de prioridade). */
@Component({
  selector: 'app-field-message',
  templateUrl: './field-message.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldMessage {
  readonly id = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly success = input<string | null>(null);
  readonly hint = input<string | null>(null);
}
