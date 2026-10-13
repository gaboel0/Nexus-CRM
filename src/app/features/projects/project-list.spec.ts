import {
  MOCK_PROJECT_TEAMS,
  MOCK_PROJECTS,
  MOCK_TASKS,
  MOCK_TEAM,
} from '../../core/mocks/mock-data';
import { buildProjectGroups } from './project-list';

describe('buildProjectGroups', () => {
  it('agrupa os projetos por equipe, abertos pelo prazo e concluídos no fim', () => {
    const groups = buildProjectGroups(MOCK_PROJECT_TEAMS, MOCK_PROJECTS, MOCK_TASKS, MOCK_TEAM);

    expect(groups.map((g) => [g.team?.name, g.projects.map((p) => p.project.name)])).toEqual([
      ['Produto digital', ['Portal do cliente', 'Redesign do site']],
      ['Mobile', ['App mobile 2.0']],
      ['Plataforma', ['Integração com ERP', 'Migração para a nuvem']],
    ]);
  });

  it('traz o líder e o andamento de cada projeto', () => {
    const [, , platform] = buildProjectGroups(
      MOCK_PROJECT_TEAMS,
      MOCK_PROJECTS,
      MOCK_TASKS,
      MOCK_TEAM,
    );

    expect(platform.projects[0]).toEqual(
      expect.objectContaining({
        leadName: 'Diego Ramos',
        doneTasks: 1,
        totalTasks: 2,
        progress: 50,
      }),
    );
  });

  it('mantém equipe sem projetos e junta os de equipe desconhecida num grupo sem equipe', () => {
    const orphan = { ...MOCK_PROJECTS[0], teamId: 99 };
    const groups = buildProjectGroups(MOCK_PROJECT_TEAMS.slice(0, 1), [orphan], [], MOCK_TEAM);

    expect(groups.map((g) => [g.team?.name ?? null, g.projects.length])).toEqual([
      ['Produto digital', 0],
      [null, 1],
    ]);
    expect(groups[1].projects[0].progress).toBe(0);
  });
});
