import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  viewChild,
} from '@angular/core';
import { animateElement } from '../../motion/motion';
import { Icon } from '../icon/icon';

const ENTER_OPTIONS: KeyframeAnimationOptions = {
  duration: 320,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
};
const END_ENTER_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: 'translateX(40px)' },
  { opacity: 1, transform: 'translateX(0)' },
];
const CENTER_ENTER_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: 'scale(0.96)' },
  { opacity: 1, transform: 'scale(1)' },
];

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let nextModalId = 0;

/**
 * `center`: diálogo modal centralizado sobre o fundo escurecido, com cabeçalho e X próprios.
 * Bloqueia a página, prende o Tab e fecha com clique no fundo.
 * `end`: painel não modal à direita, sem escurecer o fundo e sem chrome; o conteúdo traz o
 * cabeçalho (por exemplo, `app-form-panel`). A página continua clicável e acessível pelo Tab,
 * para que botões da tela possam mudar o conteúdo do painel. Fecha com Esc ou pelo conteúdo.
 */
export type ModalPlacement = 'center' | 'end';

/**
 * Diálogo modal. Fecha com Esc, clique no fundo ou botão de fechar; quem decide fechar é o pai,
 * que recebe `closed` e atualiza `open`. Mantém o foco dentro do diálogo e o devolve ao fechar.
 */
@Component({
  selector: 'app-modal',
  imports: [Icon],
  templateUrl: './modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class Modal {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly placement = input<ModalPlacement>('center');
  readonly closed = output<void>();

  protected readonly titleId = `app-modal-title-${nextModalId++}`;
  protected readonly isModal = computed(() => this.placement() === 'center');
  /** No painel, o fundo não recebe cliques: eles passam para a página. */
  protected readonly overlayClasses = computed(() =>
    this.isModal()
      ? 'justify-center bg-crm-text/40 p-4'
      : 'pointer-events-none justify-end p-4 sm:pr-12 lg:pr-24',
  );
  protected readonly dialogClasses = computed(() =>
    this.isModal()
      ? 'max-h-full w-full max-w-lg overflow-y-auto rounded-xl border border-crm-card-border bg-crm-surface p-6 shadow-lg outline-none'
      : 'pointer-events-auto max-h-full w-full max-w-md overflow-y-auto outline-none',
  );

  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.previouslyFocused = this.document.activeElement as HTMLElement | null;
        afterNextRender(() => this.enter(), { injector: this.injector });
      } else {
        this.previouslyFocused?.focus();
        this.previouslyFocused = null;
      }
    });
  }

  onEscape(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }

  /** Foca o diálogo e anima a entrada: o painel desliza da direita; o centralizado amplia. */
  private enter(): void {
    const dialog = this.dialog()?.nativeElement;
    if (!dialog) return;

    dialog.focus();
    const keyframes = this.placement() === 'end' ? END_ENTER_KEYFRAMES : CENTER_ENTER_KEYFRAMES;
    animateElement(dialog, keyframes, ENTER_OPTIONS);
  }

  /** Mantém o Tab circulando entre os elementos focáveis do diálogo. */
  protected onDialogKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab' && this.isModal()) {
      this.trapTab(event);
    }
  }

  private trapTab(event: KeyboardEvent): void {
    const container = this.dialog()?.nativeElement;
    if (!container) return;

    const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.document.activeElement;

    if (event.shiftKey && (active === first || active === container)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
