import { MOCK_TASKS } from '../../core/mocks/mock-data';
import { projectProgress } from './project-progress';

describe('projectProgress', () => {
  it('conta as tarefas concluídas do projeto e arredonda a porcentagem', () => {
    expect(projectProgress(1, MOCK_TASKS)).toEqual({ doneTasks: 1, totalTasks: 5, progress: 20 });
  });

  it('projeto sem tarefas fica com 0%', () => {
    expect(projectProgress(1, [])).toEqual({ doneTasks: 0, totalTasks: 0, progress: 0 });
  });
});
