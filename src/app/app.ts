import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { Button, Icon } from './shared';

/**
 * Shell da aplicação: as rotas e, fixo no canto superior direito de todas as telas, o botão de
 * tema escuro/claro. O tema vale para o app inteiro (`data-theme` no `<html>`, pelo ThemeService).
 */
@Component({
  imports: [RouterOutlet, Button, Icon],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly theme = inject(ThemeService);

  protected readonly isDark = this.theme.isDark;
  /** No escuro, contorno branco; no claro, a variante secundária (o contorno sumiria). */
  protected readonly toggleVariant = computed(() =>
    this.isDark() ? ('outline' as const) : ('secondary' as const),
  );
  protected readonly toggleLabel = computed(() =>
    this.isDark() ? 'Ativar modo claro' : 'Ativar modo escuro',
  );

  protected toggleTheme(): void {
    this.theme.toggle();
  }
}
