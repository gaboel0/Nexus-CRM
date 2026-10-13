import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { FormPanel, FormPanelField, TextLink } from '../../../../shared';

/** `register`: cadastro de conta. `login`: entrada no sistema. */
export type AuthFormMode = 'register' | 'login';

/** Credenciais enviadas pelo formulário de entrada. */
export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

/** Página futura de recuperação de senha. Até existir, o link cai no redirecionamento padrão. */
export const FORGOT_PASSWORD_PATH = '/esqueci-minha-senha';

const SAVED_STATUS = 'Dados validados. O envio ao servidor ainda não está integrado.';

const LOGIN_FIELDS: FormPanelField[] = [
  {
    name: 'email',
    label: 'E-mail',
    type: 'email',
    autocomplete: 'email',
    errors: { required: 'Informe seu e-mail.', email: 'Informe um e-mail válido.' },
  },
  {
    name: 'password',
    label: 'Senha',
    type: 'password',
    autocomplete: 'current-password',
    errors: {
      required: 'Informe sua senha.',
      minlength: 'A senha precisa ter ao menos 6 caracteres.',
    },
  },
];

const REGISTER_FIELDS: FormPanelField[] = [
  {
    name: 'name',
    label: 'Nome completo',
    autocomplete: 'name',
    errors: { required: 'Informe seu nome.' },
  },
  {
    name: 'email',
    label: 'E-mail',
    type: 'email',
    autocomplete: 'email',
    errors: { required: 'Informe seu e-mail.', email: 'Informe um e-mail válido.' },
  },
  {
    name: 'company',
    label: 'Empresa',
    autocomplete: 'organization',
    errors: { required: 'Informe o nome da empresa.' },
  },
  {
    name: 'password',
    label: 'Senha',
    type: 'password',
    autocomplete: 'new-password',
    errors: {
      required: 'Informe uma senha.',
      minlength: 'A senha precisa ter ao menos 6 caracteres.',
    },
  },
  {
    name: 'confirmPassword',
    label: 'Confirmar senha',
    type: 'password',
    autocomplete: 'new-password',
    errors: { required: 'Confirme a senha.', mismatch: 'As senhas não coincidem.' },
  },
];

/** A confirmação precisa ser igual à senha. Erro do próprio campo de confirmação. */
function sameAsPassword(control: AbstractControl): ValidationErrors | null {
  return control.value === control.parent?.get('password')?.value ? null : { mismatch: true };
}

/**
 * Formulário do painel lateral da tela de autenticação. Mostra o cadastro ou a entrada conforme
 * `mode`, sempre no mesmo `app-form-panel`: trocar o modo transforma o cartão em vez de recriá-lo.
 * O cadastro só valida (o envio ao servidor ainda não existe). A entrada emite `login` com as
 * credenciais; quem chama o serviço de autenticação é a página.
 */
@Component({
  selector: 'app-auth-form',
  imports: [FormPanel, TextLink],
  templateUrl: './auth-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthForm {
  readonly mode = input.required<AuthFormMode>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  readonly login = output<LoginCredentials>();
  readonly closed = output<void>();

  private readonly formBuilder = inject(FormBuilder);

  protected readonly validated = signal(false);
  protected readonly forgotPasswordPath = FORGOT_PASSWORD_PATH;

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['admin@crm.com', [Validators.required, Validators.email]],
    password: ['123456', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly registerForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    company: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, sameAsPassword]],
  });

  protected readonly isLogin = computed(() => this.mode() === 'login');
  protected readonly form = computed(() => (this.isLogin() ? this.loginForm : this.registerForm));
  protected readonly fields = computed(() => (this.isLogin() ? LOGIN_FIELDS : REGISTER_FIELDS));
  protected readonly title = computed(() => (this.isLogin() ? 'Entrar no CRM' : 'Criar conta'));
  protected readonly submitLabel = computed(() => (this.isLogin() ? 'Entrar' : 'Criar conta'));
  protected readonly status = computed(() =>
    !this.isLogin() && this.validated() ? SAVED_STATUS : null,
  );
  protected readonly errorMessage = computed(() => (this.isLogin() ? this.error() : null));
  protected readonly pending = computed(() => this.isLogin() && this.loading());

  constructor() {
    // Trocar a senha pode tornar a confirmação válida ou inválida; revalida o campo.
    this.registerForm.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.registerForm.controls.confirmPassword.updateValueAndValidity());

    // Qualquer alteração apaga a confirmação anterior, que já não vale para os dados novos.
    this.registerForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.validated.set(false));
  }

  /** `submitted` só chega aqui com formulário válido. */
  protected onSubmitted(): void {
    if (this.isLogin()) {
      const { email, password } = this.loginForm.getRawValue();
      this.login.emit({ email, password });
      return;
    }

    this.validated.set(true);
  }
}
