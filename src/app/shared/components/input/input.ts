import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlValueBase } from '../../forms/control-value.base';
import { FIELD_HEIGHT, FieldState, fieldClasses } from '../../styles/field.styles';
import { FieldMessage } from '../field-message/field-message';
import { Icon, IconName } from '../icon/icon';

export type InputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';

/** Ícone padrão à esquerda de cada tipo de campo. */
const TYPE_ICONS: Record<InputType, IconName> = {
  text: 'text_fields',
  email: 'mail',
  password: 'lock',
  search: 'search',
  tel: 'call',
  url: 'link',
  number: 'tag',
};

/**
 * Campo de texto de linha única. O `label` aparece dentro do campo como placeholder, com um ícone
 * à esquerda conforme o tipo. Senha ganha botão de exibir/ocultar; erro e sucesso ganham ícone
 * e mensagem textual.
 */
@Component({
  selector: 'app-input',
  imports: [FieldMessage, Icon],
  templateUrl: './input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Input), multi: true }],
})
export class Input extends ControlValueBase<string> {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly type = input<InputType>('text');
  /** Ícone à esquerda. Se omitido, usa o ícone padrão do `type`. */
  readonly icon = input<IconName | null>(null);
  /** Texto dentro do campo. Se omitido, usa o `label`. */
  readonly placeholder = input<string | null>(null);
  readonly autocomplete = input('off');
  readonly disabled = input(false);
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly success = input<string | null>(null);

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  protected readonly passwordVisible = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly leftIcon = computed(() => this.icon() ?? TYPE_ICONS[this.type()]);
  protected readonly displayedPlaceholder = computed(() => this.placeholder() ?? this.label());
  protected readonly state = computed<FieldState>(() => {
    if (this.error()) return 'error';
    return this.success() ? 'success' : 'default';
  });
  protected readonly inputType = computed(() =>
    this.type() === 'password' && this.passwordVisible() ? 'text' : this.type(),
  );
  protected readonly messageId = computed(() =>
    this.error() || this.success() || this.hint() ? `${this.id()}-message` : null,
  );
  protected readonly classes = computed(() => {
    const right = this.type() === 'password' || this.state() !== 'default' ? 'pr-10' : 'pr-3';
    return fieldClasses(this.state(), `${FIELD_HEIGHT} pl-10 ${right}`);
  });

  protected emptyValue(): string {
    return '';
  }

  protected onInput(event: Event): void {
    this.update((event.target as HTMLInputElement).value);
  }

  protected togglePassword(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  /** Leva o foco ao campo. Usado pelo pai quando a ação precisa começar por ele. */
  focus(): void {
    this.field().nativeElement.focus();
  }
}
