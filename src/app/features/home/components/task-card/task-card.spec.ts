import { TestBed } from '@angular/core/testing';
import { BoardTask } from '../../dashboard-stats';
import { TaskCard } from './task-card';

const TASK: BoardTask = {
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
};

describe('TaskCard', () => {
  function render(task: BoardTask) {
    const fixture = TestBed.createComponent(TaskCard);
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra título, projeto, prioridade, atraso e responsável', () => {
    const text = render(TASK).textContent;

    expect(text).toContain('Tela de faturas');
    expect(text).toContain('Portal do cliente');
    expect(text).toContain('Prioridade alta');
    expect(text).toContain('Atrasada · 09/10');
    expect(text).toContain('Responsável: Bruno Martins');
  });

  it('sem atraso nem responsável mostra só o prazo e "Sem responsável"', () => {
    const text = render({ ...TASK, overdue: false, assignee: null }).textContent;

    expect(text).toContain('09/10');
    expect(text).not.toContain('Atrasada');
    expect(text).toContain('Sem responsável');
  });
});
