import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

/** Tema visual: `dark` (padrão) ou `light`. */
export type ThemeMode = 'dark' | 'light';

/** Chave do `localStorage` com a preferência de tema. Não é um dado sensível. */
export const THEME_STORAGE_KEY = 'crm.theme';

/**
 * Preferência de tema da interface, lembrada entre visitas. O modo vai para `data-theme` no
 * `<html>`, que troca os tokens do design system no app inteiro (ver `styles.css`).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _mode = signal<ThemeMode>(this.loadFromStorage());

  readonly mode = this._mode.asReadonly();
  readonly isDark = computed(() => this._mode() === 'dark');

  private readonly document = inject(DOCUMENT);

  constructor() {
    // Sincroniza o atributo do <html> com o tema (efeito de DOM, não deriva estado).
    effect(() => this.document.documentElement.setAttribute('data-theme', this._mode()));
  }

  toggle(): void {
    this.set(this.isDark() ? 'light' : 'dark');
  }

  set(mode: ThemeMode): void {
    this._mode.set(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Sem acesso ao armazenamento (ex.: modo privado restrito): o tema vale só nesta visita.
    }
  }

  private loadFromStorage(): ThemeMode {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  }
}
