import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Superfície branca com borda e sombra suave. Título opcional no cabeçalho.
 * Com `fill`, o card ocupa a altura do contêiner e o corpo vira uma coluna flexível: o conteúdo
 * projetado pode usar `flex-1 min-h-0 overflow-y-auto` para rolar dentro do card.
 */
@Component({
  selector: 'app-card',
  templateUrl: './card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses()' },
})
export class Card {
  readonly title = input<string | null>(null);
  readonly padded = input(true);
  readonly fill = input(false);

  protected readonly hostClasses = computed(() =>
    this.fill() ? 'flex min-h-0 flex-col' : 'block',
  );
  protected readonly sectionClasses = computed(
    () =>
      'rounded-xl border border-crm-card-border bg-crm-surface shadow-sm' +
      (this.fill() ? ' flex min-h-0 flex-1 flex-col' : ''),
  );
  protected readonly bodyClasses = computed(() =>
    [this.padded() ? 'p-5' : '', this.fill() ? 'flex min-h-0 flex-1 flex-col' : ''].join(' '),
  );
}
