import { TestBed } from '@angular/core/testing';
import { BoardColumn } from '../../dashboard-stats';
import { TaskBoard, TaskMove } from './task-board';

const COLUMNS: BoardColumn[] = [
  {
    status: 'a fazer',
    label: 'A fazer',
    tasks: [
      {
        id: 1,
        title: 'Tela de faturas',
        description: 'Descrição de Tela de faturas.',
        projectName: 'Portal do cliente',
        statusLabel: 'A fazer',
        priority: 'alta',
        dueDate: '2026-10-09',
        completedAt: null,
        overdue: true,
        assignee: { name: 'Bruno Martins', initials: 'BM', role: 'Desenvolvedor' },
      },
      {
        id: 2,
        title: 'Notificações por e-mail',
        description: 'Descrição de Notificações por e-mail.',
        projectName: 'Portal do cliente',
        statusLabel: 'A fazer',
        priority: 'baixa',
        dueDate: '2026-10-31',
        completedAt: null,
        overdue: false,
        assignee: null,
      },
    ],
  },
  { status: 'concluída', label: 'Concluídas', tasks: [] },
];

describe('TaskBoard', () => {
  function setup() {
    const fixture = TestBed.createComponent(TaskBoard);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.detectChanges();
    const moves: TaskMove[] = [];
    fixture.componentInstance.taskMoved.subscribe((move) => moves.push(move));
    return { fixture, root: fixture.nativeElement as HTMLElement, moves };
  }

  function render() {
    return setup().root;
  }

  /** jsdom não tem DragEvent; um Event com o tipo certo basta para os handlers. */
  function drag(target: Element, type: string) {
    target.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
  }

  it('mostra uma coluna por status, com título e contagem', () => {
    const root = render();
    const columns = root.querySelectorAll('section');

    expect(columns).toHaveLength(2);
    expect(columns[0].querySelector('h3')?.textContent).toContain('A fazer');
    expect(columns[0].textContent).toContain('2 tarefas');
    expect(columns[0].getAttribute('aria-labelledby')).toBe(columns[0].querySelector('h3')?.id);
  });

  it('indica atraso com texto, prazo e responsável', () => {
    const [overdue, unassigned] = Array.from(render().querySelectorAll('section:first-child li'));

    expect(overdue.textContent).toContain('Atrasada · 09/10');
    expect(overdue.textContent).toContain('Responsável: Bruno Martins');
    expect(unassigned.textContent).toContain('31/10');
    expect(unassigned.textContent).toContain('Sem responsável');
    expect(unassigned.textContent).not.toContain('Atrasada');
  });

  it('coluna sem tarefas mostra o estado vazio', () => {
    const done = render().querySelectorAll('section')[1];

    expect(done.textContent).toContain('Nenhuma tarefa');
  });

  it('arrastar uma tarefa para outra coluna emite a mudança de status e anuncia', () => {
    const { fixture, root, moves } = setup();
    const [todo, done] = Array.from(root.querySelectorAll('section'));

    drag(todo.querySelector('li[data-task-id="1"]')!, 'dragstart');
    drag(done, 'dragover');
    fixture.detectChanges();
    expect(done.className).toContain('bg-crm-light');

    drag(done, 'drop');
    fixture.detectChanges();

    expect(moves).toEqual([{ taskId: 1, status: 'concluída' }]);
    expect(root.querySelector('[aria-live]')?.textContent).toContain(
      'Tela de faturas movida para Concluídas',
    );
  });

  it('soltar na mesma coluna não emite nada', () => {
    const { root, moves } = setup();
    const todo = root.querySelector('section')!;

    drag(todo.querySelector('li[data-task-id="1"]')!, 'dragstart');
    drag(todo, 'dragover');
    drag(todo, 'drop');

    expect(moves).toEqual([]);
  });

  it('setas movem a tarefa para a coluna vizinha, sem passar das pontas', () => {
    const { root, moves } = setup();
    const card = root.querySelector('li[data-task-id="2"]')!;

    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

    expect(moves).toEqual([{ taskId: 2, status: 'concluída' }]);
  });

  it('clique, Enter e Espaço emitem a abertura dos detalhes', () => {
    const { root, fixture, moves } = setup();
    const opened: number[] = [];
    fixture.componentInstance.taskOpened.subscribe((id) => opened.push(id));
    const card = root.querySelector<HTMLElement>('li[data-task-id="1"]')!;

    card.click();
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    root
      .querySelector('li[data-task-id="2"]')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

    expect(opened).toEqual([1, 1, 2]);
    expect(moves).toEqual([]);
  });
});
