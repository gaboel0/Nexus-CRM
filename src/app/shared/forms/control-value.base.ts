import { Directive, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

/**
 * Base para componentes de campo que funcionam com `formControl`, `formControlName` e `ngModel`.
 * Mantém o valor e o estado de desabilitado em signals e cuida do contrato ControlValueAccessor.
 */
@Directive()
export abstract class ControlValueBase<T> implements ControlValueAccessor {
  protected readonly value = signal<T>(this.emptyValue());
  protected readonly cvaDisabled = signal(false);

  private changeFn: (value: T) => void = () => {};
  private touchedFn: () => void = () => {};

  /** Valor usado quando o formulário limpa o campo (`null`/`undefined`). */
  protected abstract emptyValue(): T;

  writeValue(value: T | null): void {
    this.value.set(value ?? this.emptyValue());
  }

  registerOnChange(fn: (value: T) => void): void {
    this.changeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.touchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected update(value: T): void {
    this.value.set(value);
    this.changeFn(value);
  }

  protected markTouched(): void {
    this.touchedFn();
  }
}
