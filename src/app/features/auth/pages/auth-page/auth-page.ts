import {
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { Button, Modal, animateElement } from '../../../../shared';
import { AuthForm, AuthFormMode, LoginCredentials } from '../../components/auth-form/auth-form';
import { CityScene } from '../../components/city-scene/city-scene';

const HERO_PHRASE = 'Grandes resultados começam com boas conexões.';
const REGISTER_PHRASE = 'Cada novo cadastro é o início de uma grande conexão.';

/** Rolamento da frase: gira no eixo horizontal, passa um pouco do ponto e assenta de frente. */
const HEADLINE_ROLL_KEYFRAMES: Keyframe[] = [
  { transform: 'perspective(800px) rotateX(90deg)', opacity: 0 },
  { transform: 'perspective(800px) rotateX(-10deg)', opacity: 1, offset: 0.7 },
  { transform: 'perspective(800px) rotateX(0deg)', opacity: 1 },
];
const HEADLINE_ROLL_OPTIONS: KeyframeAnimationOptions = {
  duration: 600,
  easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
};

/**
 * Tela de autenticação: compõe o cenário 3D, os botões de entrada e o painel lateral, que mostra o
 * cadastro ou a entrada. A autenticação fica no `AuthService`; as validações, no `AuthForm`.
 */
@Component({
  selector: 'app-auth-page',
  imports: [Button, AuthForm, CityScene, Modal],
  templateUrl: './auth-page.html',
})
export class AuthPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly theme = inject(ThemeService);

  protected readonly isDark = this.theme.isDark;
  /** Escuro: cenário preto e textos brancos. Claro: fundo `canvas` e textos `text`. */
  protected readonly pageClasses = computed(() => (this.isDark() ? 'bg-black' : 'bg-crm-canvas'));
  protected readonly gradientClasses = computed(() =>
    this.isDark() ? 'from-black/85 via-black/30' : 'from-crm-canvas/90 via-crm-canvas/30',
  );
  protected readonly headlineClasses = computed(() =>
    this.isDark() ? 'text-white drop-shadow-lg' : 'text-crm-text',
  );
  /** O contorno branco some no fundo claro; lá o botão Entrar usa a variante secundária. */
  protected readonly lightOnDarkVariant = computed(() =>
    this.isDark() ? ('outline' as const) : ('secondary' as const),
  );

  protected readonly cityScene = viewChild.required(CityScene);
  /** Modo do painel lateral; `null` quando o painel está fechado. */
  protected readonly panelMode = signal<AuthFormMode | null>(null);
  protected readonly panelOpen = computed(() => this.panelMode() !== null);
  protected readonly panelTitle = computed(() =>
    this.panelMode() === 'login' ? 'Entrar no CRM' : 'Criar conta',
  );
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  /** Frase do hero: a de cadastro só aparece com o painel de cadastro aberto. */
  protected readonly headline = computed(() =>
    this.panelMode() === 'register' ? REGISTER_PHRASE : HERO_PHRASE,
  );

  private readonly headlineElement = viewChild.required<ElementRef<HTMLElement>>('headlineRef');
  private previousHeadline: string | null = null;

  constructor() {
    // Depois de renderizar a frase nova, faz o rolamento. Na primeira renderização não anima.
    afterRenderEffect({
      write: () => {
        const text = this.headline();
        if (this.previousHeadline !== null && this.previousHeadline !== text) {
          animateElement(
            this.headlineElement().nativeElement,
            HEADLINE_ROLL_KEYFRAMES,
            HEADLINE_ROLL_OPTIONS,
          );
        }
        this.previousHeadline = text;
      },
    });

    // A cena 3D acompanha o tema (também no primeiro carregamento, com a preferência salva).
    afterRenderEffect({ write: () => this.cityScene().setTheme(this.theme.mode()) });
  }

  /** Cadastrar: a câmera vai para a vista lateral e o painel de cadastro abre à direita. */
  protected openRegister(): void {
    this.openPanel('register');
  }

  /** Entrar: o mesmo painel passa a mostrar o login; com o cadastro aberto, o cartão se transforma. */
  protected openLogin(): void {
    this.openPanel('login');
  }

  /** Fechar o painel devolve a câmera à vista aérea e restaura a frase inicial. */
  protected closePanel(): void {
    this.panelMode.set(null);
    this.cityScene().setView('aerial');
  }

  protected onLogin(credentials: LoginCredentials): void {
    this.loading.set(true);
    this.error.set(null);

    this.auth
      .login(credentials.email, credentials.password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/home']),
        error: (err: Error) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  private openPanel(mode: AuthFormMode): void {
    this.panelMode.set(mode);
    this.cityScene().setView('side');
  }
}
