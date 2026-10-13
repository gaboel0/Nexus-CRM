import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  function create(): ThemeService {
    TestBed.configureTestingModule({});
    return TestBed.inject(ThemeService);
  }

  it('começa no modo escuro quando não há preferência salva', () => {
    const service = create();

    expect(service.mode()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });

  it('alterna entre escuro e claro e salva a preferência', () => {
    const service = create();

    service.toggle();
    expect(service.mode()).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

    service.toggle();
    expect(service.mode()).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('recupera a preferência salva', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');

    expect(create().mode()).toBe('light');
  });

  it('ignora valores desconhecidos no armazenamento', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'roxo');

    expect(create().mode()).toBe('dark');
  });

  it('marca o tema no atributo data-theme do <html>', () => {
    const service = create();
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    service.toggle();
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
