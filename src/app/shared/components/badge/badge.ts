import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Tom semântico do selo. O texto do selo sempre acompanha a cor. */
export type BadgeTone = 'neutral' | 'primary' | 'error' | 'success';

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-crm-canvas text-crm-muted',
  primary: 'bg-crm-primary/10 text-crm-link',
  error: 'bg-crm-error/10 text-crm-error',
  success: 'bg-crm-success/10 text-crm-success-text',
};

/** Selo arredondado para status e categorias. O conteúdo é o texto exibido. */
@Component({
  selector: 'app-badge',
  templateUrl: './badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');

  protected readonly classes = computed(
    () =>
      `inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-medium first-letter:uppercase ${TONE_CLASSES[this.tone()]}`,
  );
}
