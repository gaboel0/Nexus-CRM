import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlValueBase } from '../../forms/control-value.base';

/** Caixa de seleção com label e descrição auxiliar. O valor é `boolean`. */
@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Checkbox), multi: true }],
})
export class Checkbox extends ControlValueBase<boolean> {
  readonly label = input.required<string>();
  readonly description = input<string | null>(null);
  readonly disabled = input(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected emptyValue(): boolean {
    return false;
  }

  protected onToggle(event: Event): void {
    this.update((event.target as HTMLInputElement).checked);
  }
}
