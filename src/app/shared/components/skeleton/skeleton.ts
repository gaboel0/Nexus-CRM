import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** `block`: área retangular (raio `8px`). `text`: linha de texto. `circle`: avatar ou ícone. */
export type SkeletonShape = 'block' | 'text' | 'circle';

const SHAPE_CLASSES: Record<SkeletonShape, string> = {
  block: 'rounded-crm',
  text: 'rounded',
  circle: 'rounded-full',
};

/**
 * Bloco de carregamento (skeleton) que pulsa no lugar do conteúdo que ainda vai chegar.
 * O tamanho vem das classes do host (ex.: `class="h-4 w-24"`). Decorativo (`aria-hidden`): quem
 * usa anuncia o carregamento num contêiner com `role="status"`. Sem pulsar com movimento reduzido.
 */
@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', 'aria-hidden': 'true' },
})
export class Skeleton {
  readonly shape = input<SkeletonShape>('block');

  protected readonly classes = computed(
    () =>
      `block size-full animate-pulse bg-crm-border motion-reduce:animate-none ${SHAPE_CLASSES[this.shape()]}`,
  );
}
