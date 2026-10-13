import { TestBed } from '@angular/core/testing';
import { AUTH_STORAGE_KEY, AuthService } from './auth.service';

const SAVED_USER = { id: 2, name: 'Ana Souza', email: 'ana@crm.com', role: 'vendedor' };

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('começa deslogado quando não há sessão salva', () => {
    const auth = TestBed.inject(AuthService);

    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.currentUser()).toBeNull();
  });

  it('restaura a sessão salva no localStorage', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(SAVED_USER));
    const auth = TestBed.inject(AuthService);

    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.currentUser()?.name).toBe('Ana Souza');
  });

  it('ignora sessão corrompida no localStorage', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, '{sessão inválida');
    const auth = TestBed.inject(AuthService);

    expect(auth.isLoggedIn()).toBe(false);
  });

  it('entra com credenciais válidas, sem expor a senha, e persiste a sessão', () => {
    const auth = TestBed.inject(AuthService);
    const next = vi.fn();

    auth.login('ADMIN@crm.com ', '123456').subscribe(next);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();

    vi.advanceTimersByTime(600);

    expect(next).toHaveBeenCalledTimes(1);
    const user = next.mock.calls[0][0];
    expect(user).not.toHaveProperty('password');
    expect(user.email).toBe('admin@crm.com');
    expect(auth.isLoggedIn()).toBe(true);
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? 'null')).toEqual(user);
  });

  it('rejeita credenciais inválidas com a mensagem exibida ao usuário', () => {
    const auth = TestBed.inject(AuthService);
    const error = vi.fn();

    auth.login('admin@crm.com', 'senha-errada').subscribe({ error });
    vi.advanceTimersByTime(600);

    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'E-mail ou senha inválidos' }),
    );
    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('logout limpa a sessão em memória e no localStorage', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(SAVED_USER));
    const auth = TestBed.inject(AuthService);

    auth.logout();

    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
