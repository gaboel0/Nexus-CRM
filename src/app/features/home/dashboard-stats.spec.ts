import { MOCK_PROJECTS, MOCK_TASKS, MOCK_TEAM } from '../../core/mocks/mock-data';
import { Task } from '../../core/models/project.models';
import {
  buildDashboardStats,
  buildProjectSummaries,
  buildTaskBoard,
  buildTeamWorkload,
  initials,
  moveTask,
} from './dashboard-stats';

/** Data fixa usada nos testes: 11/10/2026, horário local. */
const TODAY = new Date(2026, 9, 11, 9, 0);

describe('buildDashboardStats', () => {
  it('calcula os indicadores a partir dos dados mockados', () => {
    expect(buildDashboardStats(MOCK_PROJECTS, MOCK_TASKS, TODAY)).toEqual({
      // Portal do cliente e App mobile 2.0.
      activeProjects: 2,
      totalProjects: 5,
      // 16 tarefas, 5 concluídas.
      openTasks: 11,
      inProgressTasks: 4,
      // Tela de faturas (09/10) e Sincronização em segundo plano (10/10).
      overdueTasks: 2,
      // Concluídas em 06/10 e 08/10; as de setembro ficam fora da janela.
      completedThisWeek: 2,
    });
  });

  it('a janela da semana inclui hoje e os 6 dias anteriores', () => {
    const done = (completedAt: string): Task => ({
      ...MOCK_TASKS[0],
      status: 'concluída',
      completedAt,
    });
    const tasks = [done('2026-10-04'), done('2026-10-05'), done('2026-10-11'), done('2026-10-12')];

    expect(buildDashboardStats([], tasks, TODAY).completedThisWeek).toBe(2);
  });
});

describe('buildProjectSummaries', () => {
  it('calcula o andamento e ordena por prazo, com os concluídos no fim', () => {
    const summaries = buildProjectSummaries(MOCK_PROJECTS, MOCK_TASKS);

    expect(summaries.map((s) => [s.project.name, s.doneTasks, s.totalTasks, s.progress])).toEqual([
      ['Integração com ERP', 1, 2, 50],
      ['Portal do cliente', 1, 5, 20],
      ['App mobile 2.0', 1, 5, 20],
      ['Migração para a nuvem', 0, 2, 0],
      ['Redesign do site', 2, 2, 100],
    ]);
  });

  it('projeto sem tarefas tem andamento zero', () => {
    expect(buildProjectSummaries([MOCK_PROJECTS[0]], [])[0].progress).toBe(0);
  });
});

describe('buildTaskBoard', () => {
  it('distribui as tarefas nas quatro colunas, na ordem do fluxo', () => {
    const board = buildTaskBoard(MOCK_TASKS, MOCK_PROJECTS, MOCK_TEAM, TODAY);

    expect(board.map((column) => [column.label, column.tasks.length])).toEqual([
      ['A fazer', 5],
      ['Em andamento', 4],
      ['Em revisão', 2],
      ['Concluídas', 5],
    ]);
  });

  it('ordena as abertas pelo prazo e marca as atrasadas', () => {
    const [todo] = buildTaskBoard(MOCK_TASKS, MOCK_PROJECTS, MOCK_TEAM, TODAY);
    const first = todo.tasks[0];

    expect(first.title).toBe('Sincronização em segundo plano');
    expect(first.overdue).toBe(true);
    expect(first.projectName).toBe('App mobile 2.0');
    expect(first.assignee).toEqual({
      name: 'Bruno Martins',
      initials: 'BM',
      role: 'Desenvolvedor front-end',
    });
    expect(first.statusLabel).toBe('A fazer');
    expect(first.description).toContain('Sincronizar os dados do app');
    expect(first.completedAt).toBeNull();
    expect(todo.tasks.filter((task) => task.overdue)).toHaveLength(1);
  });

  it('tarefa sem responsável fica com assignee nulo; concluídas vêm da mais recente', () => {
    const board = buildTaskBoard(MOCK_TASKS, MOCK_PROJECTS, MOCK_TEAM, TODAY);
    const unassigned = board[0].tasks.find((task) => task.title === 'Notificações por e-mail');

    expect(unassigned?.assignee).toBeNull();
    expect(board[3].tasks[0].title).toBe('Protótipo do modo offline');
    expect(board[3].tasks.every((task) => !task.overdue)).toBe(true);
  });
});

describe('buildTeamWorkload', () => {
  it('conta tarefas abertas e atrasadas por membro, do mais ocupado ao menos', () => {
    const workload = buildTeamWorkload(MOCK_TEAM, MOCK_TASKS, TODAY);

    expect(workload.map((w) => [w.member.name, w.openTasks, w.overdueTasks])).toEqual([
      ['Diego Ramos', 3, 0],
      ['Ana Souza', 2, 0],
      ['Bruno Martins', 2, 2],
      ['Elisa Prado', 2, 0],
      ['Carla Dias', 1, 0],
    ]);
  });
});

describe('initials', () => {
  it('usa o primeiro e o último nome', () => {
    expect(initials('Ana Maria Souza')).toBe('AS');
    expect(initials('Admin')).toBe('A');
    expect(initials('  ')).toBe('');
  });
});

describe('moveTask', () => {
  const task: Task = {
    id: 1,
    title: 'Tarefa',
    description: '',
    projectId: 1,
    assigneeId: null,
    status: 'em revisão',
    priority: 'média',
    dueDate: '2026-10-20',
    completedAt: null,
  };

  it('ao concluir, registra a data de hoje e não altera a lista original', () => {
    const tasks = [task];
    const [moved] = moveTask(tasks, 1, 'concluída', TODAY);

    expect(moved).toEqual({ ...task, status: 'concluída', completedAt: '2026-10-11' });
    expect(tasks[0].status).toBe('em revisão');
  });

  it('ao reabrir, limpa a data de conclusão', () => {
    const done: Task = { ...task, status: 'concluída', completedAt: '2026-10-05' };

    expect(moveTask([done], 1, 'a fazer', TODAY)[0]).toEqual({
      ...done,
      status: 'a fazer',
      completedAt: null,
    });
  });

  it('mantém a tarefa quando o id não existe ou o status é o mesmo', () => {
    expect(moveTask([task], 99, 'a fazer', TODAY)[0]).toBe(task);
    expect(moveTask([task], 1, 'em revisão', TODAY)[0]).toBe(task);
  });
});
