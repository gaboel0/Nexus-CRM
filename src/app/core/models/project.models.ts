/** Tipos do domínio de gestão de projetos e atividades do time. Datas no formato `YYYY-MM-DD`. */

export type ProjectStatus = 'planejamento' | 'em andamento' | 'pausado' | 'concluído';

/** Equipe que agrupa projetos (ex.: "Produto digital"). Não confundir com `TeamMember`. */
export interface ProjectTeam {
  id: number;
  name: string;
  description: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  /** Equipe dona do projeto (`ProjectTeam`). */
  teamId: number;
  /** Membro da equipe responsável pelo projeto. */
  leadId: number;
  startDate: string;
  dueDate: string;
}

export type TaskStatus = 'a fazer' | 'em andamento' | 'em revisão' | 'concluída';

export type TaskPriority = 'baixa' | 'média' | 'alta';

export interface Task {
  id: number;
  title: string;
  /** Descrição completa, exibida nos detalhes da tarefa. */
  description: string;
  projectId: number;
  /** `null` quando a tarefa ainda não tem responsável. */
  assigneeId: number | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  /** Data de conclusão; `null` enquanto a tarefa está aberta. */
  completedAt: string | null;
}

export interface TeamMember {
  id: number;
  name: string;
  /** Função no time (ex.: "Designer"). */
  role: string;
}

/** Comentário de um membro do time numa tarefa. */
export interface TaskComment {
  id: number;
  taskId: number;
  authorName: string;
  content: string;
  /** Data e hora em ISO 8601. */
  createdAt: string;
}

/**
 * Tom do selo de cada status de projeto, usado em todas as telas que mostram o status. Os valores
 * correspondem a `BadgeTone` (`shared/components/badge`).
 */
export const PROJECT_STATUS_TONE: Record<
  ProjectStatus,
  'neutral' | 'primary' | 'error' | 'success'
> = {
  planejamento: 'neutral',
  'em andamento': 'primary',
  pausado: 'error',
  concluído: 'success',
};
