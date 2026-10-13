import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { delay, of } from 'rxjs';
import { AUTH_STORAGE_KEY } from '../../../../core/services/auth.service';
import { ProjectDataService } from '../../../../core/services/project-data.service';
import { HomePage } from './home-page';

const SAVED_USER = { id: 2, name: 'Ana Souza', email: 'ana@crm.com', role: 'vendedor' };

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(SAVED_USER));
    vi.useFakeTimers();
    // Prazos e atrasos dependem da data de hoje; os mocks giram em torno de 11/10/2026.
    vi.setSystemTime(new Date(2026, 9, 11, 9, 0));
    TestBed.configureTestingModule({ imports: [HomePage], providers: [provideRouter([])] });
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  function render() {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    return fixture;
  }

  it('mostra skeletons até os dados chegarem e anuncia o carregamento', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[role="status"]')?.textContent).toContain('Carregando');
    expect(root.querySelectorAll('app-skeleton').length).toBeGreaterThan(0);

    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(root.querySelector('app-skeleton')).toBeNull();
    expect(root.querySelector('[role="status"]')).toBeNull();
  });

  it('com listas vazias, sai do carregamento e mostra os estados vazios', () => {
    const empty = () => of([]).pipe(delay(300));
    TestBed.overrideProvider(ProjectDataService, {
      useValue: { getProjects: empty, getTasks: empty, getTeam: empty },
    });
    const { nativeElement } = render();

    expect(nativeElement.querySelector('app-skeleton')).toBeNull();
    expect(nativeElement.textContent).toContain('Nenhum projeto cadastrado.');
    expect(nativeElement.textContent).toContain('Nenhum membro na equipe.');
    expect(nativeElement.querySelectorAll('app-task-board li')).toHaveLength(4);
    expect(nativeElement.textContent).toContain('nenhum prazo vencido');
  });

  it('exibe a saudação e os indicadores calculados a partir dos dados', () => {
    const { nativeElement } = render();
    const kpis = nativeElement.querySelector('[aria-label="Indicadores"]')?.textContent ?? '';

    expect(nativeElement.textContent).toContain('Olá, Ana Souza');
    expect(kpis).toContain('de 5 projetos');
    expect(kpis).toContain('4 em andamento');
    expect(kpis).toContain('precisam de atenção');
    expect(kpis).toContain('nos últimos 7 dias');
  });

  it('monta o quadro com as tarefas atrasadas no topo da coluna', () => {
    const { nativeElement } = render();
    const columns = nativeElement.querySelectorAll('app-task-board section');
    const firstTask = columns[0].querySelector('li');

    expect(columns).toHaveLength(4);
    expect(firstTask?.textContent).toContain('Sincronização em segundo plano');
    expect(firstTask?.textContent).toContain('Atrasada');
  });

  it('mover uma tarefa no quadro muda a coluna e os indicadores', () => {
    const fixture = render();
    const root = fixture.nativeElement as HTMLElement;
    const columns = () => root.querySelectorAll('app-task-board section');
    const before = columns()[3].querySelectorAll('li').length;
    const task = columns()[2].querySelector<HTMLElement>('li[data-task-id]');

    task?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    expect(columns()[3].querySelectorAll('li')).toHaveLength(before + 1);
    expect(root.textContent).toContain('movida para Concluídas');
  });

  it('clicar numa tarefa abre o modal com a descrição completa; Esc fecha', () => {
    const fixture = render();
    const root = fixture.nativeElement as HTMLElement;

    root.querySelector<HTMLElement>('li[data-task-id="2"]')?.click();
    fixture.detectChanges();

    const dialog = root.querySelector('[role="dialog"]');
    expect(dialog?.querySelector('h2')?.textContent).toContain('Tela de faturas');
    expect(dialog?.textContent).toContain('Criar a tela que lista as faturas do cliente');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(root.querySelector('[role="dialog"]')).toBeNull();
  });

  it('o modal da tarefa carrega os comentários e publica um novo com o nome do usuário', () => {
    const fixture = render();
    const root = fixture.nativeElement as HTMLElement;

    root.querySelector<HTMLElement>('li[data-task-id="2"]')?.click();
    fixture.detectChanges();
    expect(root.querySelector('app-task-comments [role="status"]')).not.toBeNull();

    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    const comments = () => root.querySelector('app-task-comments')!;
    expect(comments().textContent).toContain('Comentários (2)');

    const textarea = comments().querySelector('textarea')!;
    textarea.value = 'Vou revisar hoje.';
    textarea.dispatchEvent(new Event('input'));
    comments().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(comments().textContent).toContain('Comentários (3)');
    expect(comments().textContent).toContain('Ana Souza');
    expect(comments().textContent).toContain('Vou revisar hoje.');
    expect(textarea.value).toBe('');
  });

  it('mostra o andamento dos projetos e a carga da equipe', () => {
    const { nativeElement } = render();
    const bars = nativeElement.querySelectorAll('[role="progressbar"]');
    const team = nativeElement.querySelector('[aria-label="Carga de trabalho da equipe"]');

    expect(bars).toHaveLength(5);
    expect(bars[0].getAttribute('aria-label')).toBe('Andamento de Integração com ERP');
    expect(bars[0].getAttribute('aria-valuenow')).toBe('50');
    expect(bars[0].closest('a')?.getAttribute('href')).toBe('/projetos/3');
    expect(team?.querySelector('li')?.textContent).toContain('Diego Ramos');
    expect(team?.textContent).toContain('2 atrasadas');
  });

  it('a sidebar traz as seções de gestão de projetos', () => {
    const { nativeElement } = render();
    const hrefs = Array.from<HTMLAnchorElement>(nativeElement.querySelectorAll('nav a')).map(
      (link) => link.getAttribute('href'),
    );

    expect(hrefs).toEqual([
      '/home',
      '/projetos',
      '/tarefas',
      '/calendario',
      '/equipe',
      '/relatorios',
      '/configuracoes',
    ]);
  });

  it('sair encerra a sessão e volta para a tela de login', () => {
    const { nativeElement } = render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const buttons = Array.from<HTMLButtonElement>(nativeElement.querySelectorAll('button'));
    // O botão Sair fica na sidebar; o texto inclui o ligature do ícone, por isso `includes`.
    const logout = buttons.find((button) => button.textContent?.includes('Sair'));

    logout?.click();

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
