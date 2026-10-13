import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlValueBase } from '../../forms/control-value.base';
import { FieldState, fieldClasses } from '../../styles/field.styles';
import { FieldMessage } from '../field-message/field-message';

/** Área de texto com contador de caracteres opcional (`maxLength`). */
@Component({
  selector: 'app-textarea',
  imports: [FieldMessage],
  templateUrl: './textarea.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Textarea), multi: true }],
})
export class Textarea extends ControlValueBase<string> {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly rows = input(3);
  readonly maxLength = input<number | null>(null);
  readonly disabled = input(false);
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly success = input<string | null>(null);

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly state = computed<FieldState>(() => {
    if (this.error()) return 'error';
    return this.success() ? 'success' : 'default';
  });
  protected readonly messageId = computed(() =>
    this.error() || this.success() || this.hint() ? `${this.id()}-message` : null,
  );
  protected readonly classes = computed(() =>
    fieldClasses(this.state(), 'min-h-20 px-3 py-2.5 resize-y'),
  );
  protected readonly length = computed(() => this.value().length);

  protected emptyValue(): string {
    return '';
  }

  protected onTextInput(event: Event): void {
    this.update((event.target as HTMLTextAreaElement).value);
  }
}
