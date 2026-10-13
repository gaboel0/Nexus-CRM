import { TestBed } from '@angular/core/testing';
import { BoardTask } from '../../dashboard-stats';
import { TaskDetails } from './task-details';

const TASK: BoardTask = {
  id: 1,
  title: 'Tela de faturas',
  description: 'Listar as faturas do cliente com filtro por período.',
  projectName: 'Portal do cliente',
  statusLabel: 'Em andamento',
  priority: 'alta',
  dueDate: '2026-10-09',
  completedAt: null,
  overdue: true,
  assignee: { name: 'Bruno Martins', initials: 'BM', role: 'Desenvolvedor front-end' },
};

describe('TaskDetails', () => {
  function render(task: BoardTask): HTMLElement {
    const fixture = TestBed.createComponent(TaskDetails);
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra descrição, projeto, status, prioridade, prazo e responsável', () => {
    const text = render(TASK).textContent ?? '';

    expect(text).toContain('Listar as faturas do cliente com filtro por período.');
    expect(text).toContain('Portal do cliente');
    expect(text).toContain('Em andamento');
    expect(text).toContain('alta');
    expect(text).toContain('09/10/2026 · Atrasada');
    expect(text).toContain('Bruno Martins');
    expect(text).toContain('Desenvolvedor front-end');
    expect(text).not.toContain('Concluída em');
  });

  it('trata tarefa concluída, sem descrição e sem responsável', () => {
    const text =
      render({
        ...TASK,
        description: '',
        overdue: false,
        completedAt: '2026-10-08',
        assignee: null,
      }).textContent ?? '';

    expect(text).toContain('Sem descrição.');
    expect(text).toContain('Concluída em');
    expect(text).toContain('08/10/2026');
    expect(text).toContain('Sem responsável');
    expect(text).not.toContain('Atrasada');
  });
});
