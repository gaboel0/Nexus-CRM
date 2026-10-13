import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Nomes de ícones do Material Symbols (Google Fonts) usados no design system. A fonte carregada em
 * `index.html` contém **só** estes ícones (`icon_names`, em ordem alfabética): ao adicionar um nome
 * aqui, adicione-o também à URL, senão o ícone aparece como texto.
 */
export type IconName =
  | 'mail'
  | 'lock'
  | 'search'
  | 'call'
  | 'link'
  | 'tag'
  | 'text_fields'
  | 'visibility'
  | 'visibility_off'
  | 'error'
  | 'check_circle'
  | 'expand_more'
  | 'close'
  | 'dark_mode'
  | 'light_mode'
  | 'dashboard'
  | 'group'
  | 'folder'
  | 'checklist'
  | 'calendar_month'
  | 'bar_chart'
  | 'settings'
  | 'logout'
  | 'menu'
  | 'menu_open';

/** `sm` 16px, `md` 20px (padrão), `lg` 24px. */
export type IconSize = 'sm' | 'md' | 'lg';

/** Espessura do traço. O padrão do design system é `light`, mais fino. */
export type IconWeight = 'thin' | 'light' | 'regular' | 'medium';

const SIZE_CLASSES: Record<IconSize, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
};

/** Tamanho óptico (eixo `opsz` da fonte) que acompanha cada tamanho. */
const OPTICAL_SIZE: Record<IconSize, number> = { sm: 20, md: 20, lg: 24 };

const WEIGHT_VALUES: Record<IconWeight, number> = {
  thin: 200,
  light: 300,
  regular: 400,
  medium: 500,
};

/**
 * Ponto único para os ícones da aplicação (Material Symbols, fonte variável carregada em
 * `index.html`). Recebe o nome do ligature e controla tamanho, espessura e preenchimento.
 * A cor vem do texto do elemento pai (`currentColor`).
 */
@Component({
  selector: 'app-icon',
  templateUrl: './icon.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0' },
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input<IconSize>('md');
  readonly weight = input<IconWeight>('light');
  readonly filled = input(false);

  protected readonly classes = computed(
    () => `material-symbols-outlined leading-none select-none ${SIZE_CLASSES[this.size()]}`,
  );
  /** Eixos da fonte variável: preenchimento, espessura, contraste e tamanho óptico. */
  protected readonly variation = computed(
    () =>
      `'FILL' ${this.filled() ? 1 : 0}, 'wght' ${WEIGHT_VALUES[this.weight()]}, 'GRAD' 0, 'opsz' ${OPTICAL_SIZE[this.size()]}`,
  );
}
