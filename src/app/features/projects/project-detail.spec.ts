import { MOCK_PROJECTS, MOCK_TASKS, MOCK_TEAM } from '../../core/mocks/mock-data';
import { buildProjectDetail } from './project-detail';

/** Data fixa usada nos testes: 11/10/2026, horário local. */
const TODAY = new Date(2026, 9, 11, 9, 0);

describe('buildProjectDetail', () => {
  it('monta líder, andamento e tarefas do projeto', () => {
    const detail = buildProjectDetail(3, MOCK_PROJECTS, MOCK_TASKS, MOCK_TEAM, TODAY);

    expect(detail?.project.name).toBe('Integração com ERP');
    expect(detail?.lead).toEqual({ name: 'Diego Ramos', role: 'Desenvolvedor back-end' });
    expect([detail?.doneTasks, detail?.totalTasks, detail?.progress]).toEqual([1, 2, 50]);
    // Aberta primeiro, concluída no fim.
    expect(detail?.tasks.map((task) => task.title)).toEqual([
      'Retomar contrato com o fornecedor',
      'Mapear tabelas de estoque',
    ]);
  });

  it('marca atrasadas só as tarefas abertas com prazo vencido', () => {
    const detail = buildProjectDetail(1, MOCK_PROJECTS, MOCK_TASKS, MOCK_TEAM, TODAY);
    const overdue = detail?.tasks.filter((task) => task.overdue).map((task) => task.title);

    expect(overdue).toEqual(['Tela de faturas']);
  });

  it('retorna null para projeto inexistente e 0% para projeto sem tarefas', () => {
    expect(buildProjectDetail(99, MOCK_PROJECTS, MOCK_TASKS, MOCK_TEAM, TODAY)).toBeNull();
    expect(buildProjectDetail(1, MOCK_PROJECTS, [], MOCK_TEAM, TODAY)?.progress).toBe(0);
  });
});
