import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon, IconName } from '../icon/icon';

/** Item de navegação da sidebar. */
export interface SidebarItem {
  readonly label: string;
  readonly icon: IconName;
  /** Caminho no roteador, por exemplo `/home`. */
  readonly route: string;
}

/** Classes comuns dos itens (links e botão Sair): mesma altura, hover e foco. */
const ITEM_CLASSES = [
  'flex h-10 w-full cursor-pointer items-center gap-3 rounded-crm px-2.5 text-sm',
  'text-crm-muted outline-none transition-colors',
  'hover:bg-crm-canvas hover:text-crm-text focus-visible:shadow-crm-focus',
].join(' ');

/**
 * Sidebar flutuante à esquerda: separada das bordas, com cantos arredondados. Recolhida, mostra só
 * os ícones (o nome aparece no hover e para leitores de tela); o botão do topo a expande e recolhe.
 * O host reserva no layout a largura ocupada pela sidebar (margem + painel): numa página em `flex`,
 * expandir empurra o conteúdo em vez de cobri-lo. Abaixo de `md`, o espaço reservado fica sempre o da
 * sidebar recolhida e a expandida passa por cima, para não espremer o conteúdo no celular.
 * Não conhece serviços: recebe itens e usuário, emite `logout`.
 */
@Component({
  selector: 'app-sidebar',
  imports: [Icon, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses()' },
})
export class Sidebar {
  readonly items = input.required<readonly SidebarItem[]>();
  readonly brand = input('CRM Dashboard');
  readonly userName = input<string | null>(null);
  readonly userRole = input<string | null>(null);
  readonly logout = output<void>();

  protected readonly expanded = signal(false);
  protected readonly itemClasses = ITEM_CLASSES;

  protected readonly widthClass = computed(() => (this.expanded() ? 'w-60' : 'w-16'));
  /**
   * Espaço reservado: 16px de margem + painel (64px recolhida, 240px expandida). Anima junto com o
   * painel. Recolhida: `w-20`; expandida: `md:w-64`.
   */
  protected readonly hostClasses = computed(
    () =>
      'block shrink-0 transition-[width] duration-300 ease-out motion-reduce:transition-none ' +
      (this.expanded() ? 'w-20 md:w-64' : 'w-20'),
  );
  /** Recolhida, o texto some da tela mas continua para leitores de tela. */
  protected readonly labelClasses = computed(() =>
    this.expanded() ? 'truncate whitespace-nowrap' : 'sr-only',
  );
  protected readonly toggleLabel = computed(() =>
    this.expanded() ? 'Recolher menu' : 'Expandir menu',
  );

  protected toggle(): void {
    this.expanded.update((value) => !value);
  }
}
