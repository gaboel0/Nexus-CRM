import { Task } from '../../core/models/project.models';

/** Andamento de um projeto, contado pelas tarefas concluídas. */
export interface ProjectProgress {
  readonly doneTasks: number;
  readonly totalTasks: number;
  /** Porcentagem de tarefas concluídas, de 0 a 100. */
  readonly progress: number;
}

export function projectProgress(projectId: number, tasks: readonly Task[]): ProjectProgress {
  const projectTasks = tasks.filter((task) => task.projectId === projectId);
  const doneTasks = projectTasks.filter((task) => task.status === 'concluída').length;
  const totalTasks = projectTasks.length;
  return {
    doneTasks,
    totalTasks,
    progress: totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0,
  };
}
