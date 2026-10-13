import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { animateElement } from '../../motion/motion';
import { Button } from '../button/button';
import { Input, InputType } from '../input/input';
import { Icon } from '../icon/icon';
import { Select, SelectOption } from '../select/select';

let nextFormPanelId = 0;

const MORPH_OPTIONS: KeyframeAnimationOptions = {
  duration: 380,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
};
const FADE_OPTIONS: KeyframeAnimationOptions = { duration: 260, easing: 'ease-out' };
const FADE_IN_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: 'translateY(6px)' },
  { opacity: 1, transform: 'translateY(0)' },
];

/** Campo descrito por configuração. Com `options`, vira `app-select`; sem, `app-input`. */
export interface FormPanelField {
  /** Nome do controle no `FormGroup` recebido. */
  readonly name: string;
  readonly label: string;
  readonly type?: InputType;
  readonly autocomplete?: string;
  readonly hint?: string;
  readonly options?: SelectOption[];
  /** Mensagem por chave de erro do validador, como `required`, `email` ou `minlength`. */
  readonly errors?: Readonly<Record<string, string>>;
}

/**
 * Painel de formulário reutilizável: título, campos descritos por configuração, botão de salvar
 * no fim e botão de fechar (X) no canto superior direito. O pai dono do `FormGroup` decide o que
 * fazer ao salvar e ao fechar. O campo só mostra erro depois de tocado.
 *
 * Quando o pai troca título, campos e formulário, o mesmo cartão muda de altura com animação e o
 * conteúdo novo surge com fade. Assim um cadastro pode virar um login sem fechar o painel.
 */
@Component({
  selector: 'app-form-panel',
  imports: [ReactiveFormsModule, Button, Icon, Input, Select],
  templateUrl: './form-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class FormPanel {
  readonly title = input.required<string>();
  readonly form = input.required<FormGroup>();
  readonly fields = input.required<readonly FormPanelField[]>();
  readonly submitLabel = input('Salvar');
  readonly loading = input(false);
  /** Mensagem de resultado acima do botão de salvar, por exemplo de confirmação. */
  readonly status = input<string | null>(null);
  /** Mensagem de erro acima do botão de salvar, por exemplo de credenciais recusadas. */
  readonly error = input<string | null>(null);

  /** Disparado só quando o formulário é válido. */
  readonly submitted = output<void>();
  readonly closed = output<void>();

  protected readonly titleId = `app-form-panel-title-${nextFormPanelId++}`;

  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');
  private previousFields: readonly FormPanelField[] | null = null;
  private previousHeight = 0;

  constructor() {
    afterRenderEffect({ write: () => this.syncChange() });
  }

  protected fieldId(field: FormPanelField): string {
    return `${this.titleId}-${field.name}`;
  }

  /** Mostra a mensagem do primeiro erro do controle que tenha texto configurado. */
  protected errorFor(field: FormPanelField): string | null {
    const control: AbstractControl | null = this.form().get(field.name);
    if (!control?.touched || !control.errors) {
      return null;
    }

    const errorKey = Object.keys(control.errors).find((key) => field.errors?.[key]);
    return errorKey ? (field.errors?.[errorKey] ?? null) : null;
  }

  protected submit(): void {
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }

    this.submitted.emit();
  }

  /** Detecta a troca de conteúdo e anima a altura do cartão e o surgimento do conteúdo novo. */
  private syncChange(): void {
    const fields = this.fields();
    const card = this.card().nativeElement;
    const height = card.offsetHeight;

    if (this.previousFields !== null && this.previousFields !== fields) {
      this.animateChange(card, this.previousHeight, height);
    }

    this.previousFields = fields;
    this.previousHeight = height;
  }

  private animateChange(card: HTMLElement, fromHeight: number, toHeight: number): void {
    const morph = animateElement(
      card,
      [{ height: `${fromHeight}px` }, { height: `${toHeight}px` }],
      MORPH_OPTIONS,
    );
    if (morph) {
      // Enquanto a altura muda, o conteúdo que sobra não pode vazar para fora do cartão.
      card.style.overflow = 'hidden';
      morph.onfinish = () => (card.style.overflow = '');
    }

    animateElement(this.heading().nativeElement, FADE_IN_KEYFRAMES, FADE_OPTIONS);
    animateElement(this.content().nativeElement, FADE_IN_KEYFRAMES, FADE_OPTIONS);
  }
}
