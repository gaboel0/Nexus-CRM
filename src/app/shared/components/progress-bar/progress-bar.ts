import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ProgressBarTone = 'primary' | 'success';

/** Barra de progresso acessível (`role="progressbar"`), com valor de 0 a 100. */
@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBar {
  readonly value = input.required<number>();
  /** Nome acessível, por exemplo "Andamento de Portal do cliente". */
  readonly label = input.required<string>();
  readonly tone = input<ProgressBarTone>('primary');

  protected readonly clamped = computed(() => Math.min(100, Math.max(0, this.value())));
  protected readonly fillClass = computed(() =>
    this.tone() === 'success' ? 'bg-crm-success' : 'bg-crm-primary',
  );
}
