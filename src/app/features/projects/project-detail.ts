import {
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  TeamMember,
} from '../../core/models/project.models';
import { ProjectProgress, projectProgress } from './project-progress';

/** Pessoa exibida na página do projeto (líder ou responsável). */
export interface ProjectPerson {
  readonly name: string;
  readonly role: string;
}

/** Tarefa listada na página do projeto. */
export interface ProjectTaskRow {
  readonly id: number;
  readonly title: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly dueDate: string;
  readonly overdue: boolean;
  readonly assignee: ProjectPerson | null;
}

/** Dados da página de um projeto: o projeto, o líder, o andamento e as tarefas. */
export interface ProjectDetail extends ProjectProgress {
  readonly project: Project;
  readonly lead: ProjectPerson | null;
  /** Abertas primeiro, pelo prazo mais próximo; concluídas no fim. */
  readonly tasks: readonly ProjectTaskRow[];
}

/**
 * Monta os dados da página do projeto `projectId`. Retorna `null` quando o projeto não existe.
 * `today` é parâmetro para manter a função pura e testável.
 */
export function buildProjectDetail(
  projectId: number,
  projects: readonly Project[],
  tasks: readonly Task[],
  team: readonly TeamMember[],
  today: Date,
): ProjectDetail | null {
  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    return null;
  }
  const todayIso = toIsoDate(today);
  const person = (id: number | null): ProjectPerson | null => {
    const member = team.find((m) => m.id === id);
    return member ? { name: member.name, role: member.role } : null;
  };

  return {
    project,
    lead: person(project.leadId),
    ...projectProgress(projectId, tasks),
    tasks: tasks
      .filter((task) => task.projectId === projectId)
      .map((task): ProjectTaskRow => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        overdue: task.status !== 'concluída' && task.dueDate < todayIso,
        assignee: person(task.assigneeId),
      }))
      .sort(
        (a, b) =>
          Number(a.status === 'concluída') - Number(b.status === 'concluída') ||
          a.dueDate.localeCompare(b.dueDate),
      ),
  };
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
