import { WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AUTH_STORAGE_KEY } from '../../../../core/services/auth.service';
import { THEME_STORAGE_KEY, ThemeService } from '../../../../core/services/theme.service';
import { AuthFormMode, LoginCredentials } from '../../components/auth-form/auth-form';
import { AuthPage } from './auth-page';

const LOGIN_DELAY_MS = 600;
const HERO_PHRASE = 'Grandes resultados começam com boas conexões.';
const REGISTER_PHRASE = 'Cada novo cadastro é o início de uma grande conexão.';

/**
 * Estado e ações da página. Os membros são `protected` porque só o template os usa; o teste
 * acessa esse contrato explicitamente.
 */
interface AuthPageLogic {
  readonly panelMode: WritableSignal<AuthFormMode | null>;
  readonly loading: WritableSignal<boolean>;
  readonly error: WritableSignal<string | null>;
  onLogin(credentials: LoginCredentials): void;
}

/** Botões do hero são `app-button`; o texto identifica cada um. */
function findButton(root: HTMLElement, label: string): HTMLElement {
  const button = Array.from(root.querySelectorAll<HTMLElement>('app-button')).find(
    (element) => element.textContent?.trim() === label,
  );
  if (!button) {
    throw new Error(`Botão ${label} não encontrado`);
  }
  return button;
}

describe('AuthPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    TestBed.configureTestingModule({ imports: [AuthPage], providers: [provideRouter([])] });
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  function render() {
    const fixture = TestBed.createComponent(AuthPage);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    return {
      fixture,
      root,
      page: fixture.componentInstance as unknown as AuthPageLogic,
      navigate,
      click: (label: string) => {
        findButton(root, label).dispatchEvent(new Event('click'));
        fixture.detectChanges();
      },
    };
  }

  it('Cadastrar abre o painel de cadastro e troca a frase; Esc fecha e restaura a frase', () => {
    const { root, page, click, fixture } = render();
    const headline = () => root.querySelector('h1')?.textContent?.trim();

    click('Cadastrar');

    expect(page.panelMode()).toBe('register');
    expect(root.querySelector('[role="dialog"]')?.textContent).toContain('Criar conta');
    expect(headline()).toBe(REGISTER_PHRASE);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(page.panelMode()).toBeNull();
    expect(root.querySelector('[role="dialog"]')).toBeNull();
    expect(headline()).toBe(HERO_PHRASE);
  });

  it('Entrar abre o painel de entrada e mantém a frase inicial', () => {
    const { root, page, click } = render();

    click('Entrar');

    expect(page.panelMode()).toBe('login');
    expect(root.querySelector('[role="dialog"]')?.textContent).toContain('Entrar no CRM');
    expect(root.querySelector('h1')?.textContent?.trim()).toBe(HERO_PHRASE);
  });

  it('com o cadastro aberto, Entrar troca para o login sem fechar o painel', () => {
    const { root, page, click } = render();

    click('Cadastrar');
    const panel = root.querySelector('app-auth-form');
    click('Entrar');

    expect(page.panelMode()).toBe('login');
    expect(root.querySelector('[role="dialog"]')).not.toBeNull();
    expect(root.querySelector('app-auth-form')).toBe(panel);
  });

  it('entra com credenciais válidas, marca a espera e vai para /home', () => {
    const { page, navigate } = render();

    page.onLogin({ email: 'admin@crm.com', password: '123456' });
    expect(page.loading()).toBe(true);

    vi.advanceTimersByTime(LOGIN_DELAY_MS);

    expect(navigate).toHaveBeenCalledWith(['/home']);
  });

  it('mostra a mensagem de erro quando as credenciais são recusadas', () => {
    const { page, navigate } = render();

    page.onLogin({ email: 'admin@crm.com', password: 'senha-errada' });
    vi.advanceTimersByTime(LOGIN_DELAY_MS);

    expect(page.error()).toContain('E-mail ou senha inválidos');
    expect(page.loading()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('não navega depois de destruída: a espera da resposta é cancelada', () => {
    const { fixture, page, navigate } = render();

    page.onLogin({ email: 'admin@crm.com', password: '123456' });
    fixture.destroy();
    vi.advanceTimersByTime(LOGIN_DELAY_MS);

    expect(navigate).not.toHaveBeenCalled();
  });

  it('acompanha o tema do app: escuro por padrão, claro ao alternar no ThemeService', () => {
    const { root, fixture } = render();

    expect(root.firstElementChild?.classList).toContain('bg-black');
    // O botão de tema fica no shell (App), não na página.
    expect(root.querySelector('button[aria-label^="Ativar modo"]')).toBeNull();

    TestBed.inject(ThemeService).toggle();
    fixture.detectChanges();

    expect(root.firstElementChild?.classList).toContain('bg-crm-canvas');
    expect(root.querySelector('h1')?.classList).toContain('text-crm-text');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });
});
