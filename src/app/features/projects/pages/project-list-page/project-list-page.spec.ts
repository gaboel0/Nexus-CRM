import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AUTH_STORAGE_KEY } from '../../../../core/services/auth.service';
import { ProjectDataService } from '../../../../core/services/project-data.service';
import { ProjectListPage } from './project-list-page';

const SAVED_USER = { id: 2, name: 'Ana Souza', email: 'ana@crm.com', role: 'vendedor' };

describe('ProjectListPage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(SAVED_USER));
    vi.useFakeTimers();
    TestBed.configureTestingModule({ imports: [ProjectListPage], providers: [provideRouter([])] });
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  function render() {
    const fixture = TestBed.createComponent(ProjectListPage);
    fixture.detectChanges();
    return fixture;
  }

  function load(): HTMLElement {
    const fixture = render();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra skeletons até os dados chegarem', () => {
    const root = render().nativeElement as HTMLElement;

    expect(root.querySelector('[role="status"]')?.textContent).toContain('Carregando os projetos');
  });

  it('agrupa os projetos por equipe, em grid', () => {
    const root = load();
    const sections = Array.from(root.querySelectorAll('main section[aria-labelledby]'));

    expect(root.querySelector('h1')?.textContent).toContain('Projetos');
    expect(root.textContent).toContain('5 projetos, organizados');
    expect(sections.map((s) => s.querySelector('h2')?.textContent?.trim())).toEqual([
      'Produto digital',
      'Mobile',
      'Plataforma',
    ]);
    expect(sections[0].querySelectorAll('li a')).toHaveLength(2);
    expect(sections[2].textContent).toContain('Integração com ERP');
    expect(sections[2].textContent).toContain('Líder: Diego Ramos');
  });

  it('cada cartão leva à página do projeto', () => {
    const link = load().querySelector<HTMLAnchorElement>('main li a');

    expect(link?.getAttribute('href')).toBe('/projetos/1');
    expect(link?.textContent).toContain('Portal do cliente');
  });

  it('sem projetos, mostra o estado vazio de cada equipe', () => {
    TestBed.overrideProvider(ProjectDataService, {
      useValue: {
        getProjectTeams: () => of([{ id: 1, name: 'Mobile', description: 'Apps.' }]),
        getProjects: () => of([]),
        getTasks: () => of([]),
        getTeam: () => of([]),
      },
    });
    const root = render().nativeElement as HTMLElement;

    expect(root.textContent).toContain('Nenhum projeto nesta equipe.');
  });
});
