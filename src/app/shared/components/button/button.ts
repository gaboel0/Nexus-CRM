import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
export type ButtonType = 'button' | 'submit' | 'reset';

const BASE_CLASSES = [
  'inline-flex h-crm-input cursor-pointer items-center justify-center gap-2 rounded-crm px-4',
  'text-sm font-semibold outline-none',
  // Hover: sobe 1px com sombra suave; ao pressionar, volta. Sem movimento com movimento reduzido.
  'transition duration-200 ease-out',
  'hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm',
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
  'focus-visible:shadow-crm-focus',
  // Desabilitado: sem mão, sem subir e sem sombra.
  'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none',
].join(' ');

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-crm-primary text-white hover:bg-crm-primary-hover',
  secondary: 'border border-crm-border bg-crm-surface text-crm-text hover:bg-crm-canvas',
  danger: 'bg-crm-error text-white hover:bg-crm-error-hover',
  // Para fundos escuros (ex.: cenário do login): sem preenchimento, borda e texto brancos.
  outline:
    'border border-white bg-transparent text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
};

/** Botão com variantes do design system e estado de carregamento. */
@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<ButtonType>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);
  /** Botão quadrado só com ícone (ex.: `<app-icon>` projetado). Exige `ariaLabel`. */
  readonly iconOnly = input(false);
  /** Nome acessível do botão. Obrigatório quando não há texto visível. */
  readonly ariaLabel = input<string | null>(null);

  /** Durante o carregamento o botão fica bloqueado para evitar envio duplicado. */
  protected readonly isDisabled = computed(() => this.disabled() || this.loading());
  protected readonly classes = computed(() =>
    [
      BASE_CLASSES,
      VARIANT_CLASSES[this.variant()],
      this.fullWidth() ? 'w-full' : '',
      this.iconOnly() ? 'aspect-square px-0' : '',
    ].join(' '),
  );
}
