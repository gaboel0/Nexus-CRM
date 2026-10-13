import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthForm, AuthFormMode, FORGOT_PASSWORD_PATH, LoginCredentials } from './auth-form';

/** Os campos são gerados pelo `app-form-panel` com `id` terminando em `-<nome do campo>`. */
function requireField(root: HTMLElement, name: string): HTMLInputElement {
  const field = root.querySelector<HTMLInputElement>(`input[id$="-${name}"]`);
  if (!field) {
    throw new Error(`Campo ${name} não encontrado`);
  }
  return field;
}

function typeInto(field: HTMLInputElement, value: string): void {
  field.value = value;
  field.dispatchEvent(new Event('input'));
  field.dispatchEvent(new Event('blur'));
}

@Component({
  imports: [AuthForm],
  template: `
    <app-auth-form
      [mode]="mode()"
      [loading]="loading()"
      [error]="error()"
      (login)="onLogin($event)"
      (closed)="onClosed()"
    />
  `,
})
class HostComponent {
  readonly mode = signal<AuthFormMode>('register');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly onLogin = vi.fn<(credentials: LoginCredentials) => void>();
  readonly onClosed = vi.fn<() => void>();
}

describe('AuthForm', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideRouter([])] });
  });

  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    return {
      fixture,
      root,
      host: fixture.componentInstance,
      submit: () => {
        root.querySelector<HTMLButtonElement>('form button[type="submit"]')?.click();
        fixture.detectChanges();
      },
    };
  }

  describe('cadastro', () => {
    function fillRegister(root: HTMLElement, confirmPassword: string) {
      typeInto(requireField(root, 'name'), 'Ana Souza');
      typeInto(requireField(root, 'email'), 'ana@empresa.com');
      typeInto(requireField(root, 'company'), 'Empresa');
      typeInto(requireField(root, 'password'), 'segredo1');
      typeInto(requireField(root, 'confirmPassword'), confirmPassword);
    }

    it('mostra o título de cadastro e os erros de campos obrigatórios ao enviar vazio', () => {
      const { root, submit } = render();

      submit();

      expect(root.querySelector('h2')?.textContent).toContain('Criar conta');
      expect(root.textContent).toContain('Informe seu nome.');
      expect(root.textContent).toContain('Informe seu e-mail.');
      expect(root.querySelector('[role="status"]')).toBeNull();
    });

    it('avisa quando a confirmação de senha não coincide', () => {
      const { root, fixture } = render();

      fillRegister(root, 'segredo2');
      fixture.detectChanges();

      expect(root.textContent).toContain('As senhas não coincidem.');
    });

    it('confirma a validação quando todos os dados são válidos', () => {
      const { root, submit, fixture } = render();

      fillRegister(root, 'segredo1');
      fixture.detectChanges();
      submit();

      expect(root.querySelector('[role="status"]')?.textContent).toContain('Dados validados');
    });

    it('não envia credenciais: no cadastro, o evento de login não é emitido', () => {
      const { root, submit, host } = render();

      fillRegister(root, 'segredo1');
      submit();

      expect(host.onLogin).not.toHaveBeenCalled();
    });

    it('emite closed ao clicar no X do painel', () => {
      const { root, host } = render();

      root.querySelector<HTMLButtonElement>('button[aria-label="Fechar"]')?.click();

      expect(host.onClosed).toHaveBeenCalledTimes(1);
    });
  });

  describe('entrada', () => {
    function renderLogin() {
      const rendered = render();
      rendered.host.mode.set('login');
      rendered.fixture.detectChanges();
      return rendered;
    }

    it('mostra o título de entrada e emite as credenciais preenchidas', () => {
      const { root, submit, host } = renderLogin();

      expect(root.querySelector('h2')?.textContent).toContain('Entrar no CRM');

      submit();

      expect(host.onLogin).toHaveBeenCalledWith({ email: 'admin@crm.com', password: '123456' });
    });

    it('não emite credenciais inválidas e mostra a mensagem do e-mail', () => {
      const { root, submit, host, fixture } = renderLogin();

      typeInto(requireField(root, 'email'), 'nao-e-email');
      fixture.detectChanges();
      submit();

      expect(host.onLogin).not.toHaveBeenCalled();
      expect(root.textContent).toContain('Informe um e-mail válido.');
    });

    it('mostra o erro recebido da página', () => {
      const { root, host, fixture } = renderLogin();

      host.error.set('E-mail ou senha inválidos');
      fixture.detectChanges();

      expect(root.querySelector('[role="alert"]')?.textContent).toContain(
        'E-mail ou senha inválidos',
      );
    });

    it('troca de modo mantém o mesmo cartão e troca o conteúdo', () => {
      const { root, host, fixture } = render();
      const card = root.querySelector('app-form-panel');

      host.mode.set('login');
      fixture.detectChanges();

      expect(root.querySelector('app-form-panel')).toBe(card);
      expect(root.querySelector('h2')?.textContent).toContain('Entrar no CRM');
      expect(root.querySelector('input[id$="-name"]')).toBeNull();
    });
  });

  it('mostra o link Esqueci minha senha só no login, apontando para a página futura', () => {
    const { root, host, fixture } = render();
    const link = () => root.querySelector<HTMLAnchorElement>('app-text-link a');

    expect(link()).toBeNull();

    host.mode.set('login');
    fixture.detectChanges();

    expect(link()?.textContent?.trim()).toBe('Esqueci minha senha');
    expect(link()?.getAttribute('href')).toBe(FORGOT_PASSWORD_PATH);
  });
});
