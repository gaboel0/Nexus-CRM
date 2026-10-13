import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AUTH_STORAGE_KEY } from '../../../../core/services/auth.service';
import { ProjectDetailPage } from './project-detail-page';

const SAVED_USER = { id: 2, name: 'Ana Souza', email: 'ana@crm.com', role: 'vendedor' };

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(SAVED_USER));
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 11, 9, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  function render(id: string) {
    TestBed.configureTestingModule({
      imports: [ProjectDetailPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id })) } },
      ],
    });
    const fixture = TestBed.createComponent(ProjectDetailPage);
    fixture.detectChanges();
    return fixture;
  }

  function load(id: string): HTMLElement {
    const fixture = render(id);
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra skeleton até os dados chegarem', () => {
    const root = render('3').nativeElement as HTMLElement;

    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Carregando os dados do projeto',
    );
  });

  it('mostra nome, status, líder, andamento e tarefas do projeto do endereço', () => {
    const root = load('3');
    const text = root.textContent ?? '';

    expect(root.querySelector('h1')?.textContent).toContain('Integração com ERP');
    expect(text).toContain('pausado');
    expect(text).toContain('Diego Ramos');
    expect(text).toContain('1/2 tarefas · 50%');
    expect(root.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('50');
    expect(root.querySelectorAll('[aria-label="Tarefas do projeto"] li')).toHaveLength(2);
    expect(root.querySelector('a[href="/home"]')).not.toBeNull();
  });

  it('id inexistente mostra o estado de projeto não encontrado', () => {
    expect(load('99').textContent).toContain('Projeto não encontrado');
  });
});
