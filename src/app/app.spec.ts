import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { THEME_STORAGE_KEY } from './core/services/theme.service';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('tem o botão de tema fixo, que alterna o tema do app inteiro', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    TestBed.tick();
    const toggle = (): HTMLButtonElement | null =>
      fixture.nativeElement.querySelector('button[aria-label^="Ativar modo"]');

    expect(fixture.nativeElement.querySelector('app-button')?.classList).toContain('fixed');
    expect(toggle()?.getAttribute('aria-label')).toBe('Ativar modo claro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    toggle()?.click();
    fixture.detectChanges();
    TestBed.tick();

    expect(toggle()?.getAttribute('aria-label')).toBe('Ativar modo escuro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });
});
