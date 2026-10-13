import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlValueBase } from '../../forms/control-value.base';
import { FIELD_HEIGHT, FieldState, fieldClasses } from '../../styles/field.styles';
import { FieldMessage } from '../field-message/field-message';
import { Icon } from '../icon/icon';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Select estilizado com seta customizada. O valor é sempre `string`. */
@Component({
  selector: 'app-select',
  imports: [FieldMessage, Icon],
  templateUrl: './select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Select), multi: true }],
})
export class Select extends ControlValueBase<string> {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly options = input.required<SelectOption[]>();
  readonly placeholder = input<string | null>(null);
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
    fieldClasses(this.state(), `${FIELD_HEIGHT} appearance-none pl-3 pr-10`),
  );

  protected emptyValue(): string {
    return '';
  }

  protected onSelect(event: Event): void {
    this.update((event.target as HTMLSelectElement).value);
  }
}
