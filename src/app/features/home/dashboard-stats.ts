import {
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  TeamMember,
} from '../../core/models/project.models';

/** Indicadores exibidos no topo do painel. */
export interface DashboardStats {
  readonly activeProjects: number;
  readonly totalProjects: number;
  readonly openTasks: number;
  readonly inProgressTasks: number;
  readonly overdueTasks: number;
  /** Tarefas concluídas nos últimos 7 dias, contando hoje. */
  readonly completedThisWeek: number;
}

/** Projeto com o andamento calculado pelas tarefas. */
export interface ProjectSummary {
  readonly project: Project;
  readonly doneTasks: number;
  readonly totalTasks: number;
  /** Porcentagem de tarefas concluídas, de 0 a 100. */
  readonly progress: number;
}

/** Tarefa pronta para o quadro: com nomes resolvidos e indicação de atraso. */
export interface BoardTask {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly projectName: string;
  /** Rótulo da coluna em que a tarefa está (ex.: "Em andamento"). */
  readonly statusLabel: string;
  readonly priority: TaskPriority;
  readonly dueDate: string;
  readonly completedAt: string | null;
  readonly overdue: boolean;
  readonly assignee: {
    readonly name: string;
    readonly initials: string;
    readonly role: string;
  } | null;
}

export interface BoardColumn {
  readonly status: TaskStatus;
  readonly label: string;
  readonly tasks: readonly BoardTask[];
}

/** Carga de trabalho de um membro: tarefas abertas e atrasadas. */
export interface MemberWorkload {
  readonly member: TeamMember;
  readonly initials: string;
  readonly openTasks: number;
  readonly overdueTasks: number;
}

/** Colunas do quadro, na ordem do fluxo de trabalho. */
const BOARD_COLUMNS: readonly { status: TaskStatus; label: string }[] = [
  { status: 'a fazer', label: 'A fazer' },
  { status: 'em andamento', label: 'Em andamento' },
  { status: 'em revisão', label: 'Em revisão' },
  { status: 'concluída', label: 'Concluídas' },
];

const PRIORITY_ORDER: Record<TaskPriority, number> = { alta: 0, média: 1, baixa: 2 };

/** Deriva os indicadores do painel. `today` é parâmetro para manter a função pura e testável. */
export function buildDashboardStats(
  projects: readonly Project[],
  tasks: readonly Task[],
  today: Date,
): DashboardStats {
  const todayIso = toIsoDate(today);
  const weekStart = toIsoDate(addDays(today, -6));
  const open = tasks.filter(isOpen);

  return {
    activeProjects: projects.filter((project) => project.status === 'em andamento').length,
    totalProjects: projects.length,
    openTasks: open.length,
    inProgressTasks: tasks.filter((task) => task.status === 'em andamento').length,
    overdueTasks: open.filter((task) => task.dueDate < todayIso).length,
    completedThisWeek: tasks.filter(
      (task) =>
        task.completedAt !== null && task.completedAt >= weekStart && task.completedAt <= todayIso,
    ).length,
  };
}

/** Andamento de cada projeto. Abertos primeiro, pelo prazo mais próximo; concluídos no fim. */
export function buildProjectSummaries(
  projects: readonly Project[],
  tasks: readonly Task[],
): ProjectSummary[] {
  return projects
    .map((project) => {
      const projectTasks = tasks.filter((task) => task.projectId === project.id);
      const doneTasks = projectTasks.filter((task) => !isOpen(task)).length;
      const totalTasks = projectTasks.length;
      return {
        project,
        doneTasks,
        totalTasks,
        progress: totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0,
      };
    })
    .sort(
      (a, b) =>
        Number(a.project.status === 'concluído') - Number(b.project.status === 'concluído') ||
        a.project.dueDate.localeCompare(b.project.dueDate),
    );
}

/**
 * Agrupa as tarefas nas colunas do quadro. Nas colunas abertas, ordena por prazo e prioridade;
 * nas concluídas, da conclusão mais recente para a mais antiga.
 */
export function buildTaskBoard(
  tasks: readonly Task[],
  projects: readonly Project[],
  team: readonly TeamMember[],
  today: Date,
): BoardColumn[] {
  const todayIso = toIsoDate(today);
  const projectName = (id: number) => projects.find((project) => project.id === id)?.name ?? '—';
  const member = (id: number | null) => team.find((m) => m.id === id) ?? null;

  return BOARD_COLUMNS.map(({ status, label }) => {
    const columnTasks = tasks
      .filter((task) => task.status === status)
      .sort((a, b) =>
        status === 'concluída'
          ? (b.completedAt ?? '').localeCompare(a.completedAt ?? '')
          : a.dueDate.localeCompare(b.dueDate) ||
            PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
      )
      .map((task): BoardTask => {
        const assignee = member(task.assigneeId);
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          projectName: projectName(task.projectId),
          statusLabel: label,
          priority: task.priority,
          dueDate: task.dueDate,
          completedAt: task.completedAt,
          overdue: isOpen(task) && task.dueDate < todayIso,
          assignee: assignee
            ? { name: assignee.name, initials: initials(assignee.name), role: assignee.role }
            : null,
        };
      });
    return { status, label, tasks: columnTasks };
  });
}

/** Tarefas abertas e atrasadas por membro, do mais ao menos ocupado. */
export function buildTeamWorkload(
  team: readonly TeamMember[],
  tasks: readonly Task[],
  today: Date,
): MemberWorkload[] {
  const todayIso = toIsoDate(today);

  return team
    .map((member) => {
      const open = tasks.filter((task) => task.assigneeId === member.id && isOpen(task));
      return {
        member,
        initials: initials(member.name),
        openTasks: open.length,
        overdueTasks: open.filter((task) => task.dueDate < todayIso).length,
      };
    })
    .sort((a, b) => b.openTasks - a.openTasks || a.member.name.localeCompare(b.member.name));
}

/**
 * Muda o status de uma tarefa e devolve uma nova lista. Ao entrar em "concluída", registra a
 * conclusão em `today`; ao sair, limpa `completedAt`. Tarefa inexistente ou mesmo status: lista igual.
 */
export function moveTask(
  tasks: readonly Task[],
  taskId: number,
  status: TaskStatus,
  today: Date,
): Task[] {
  return tasks.map((task) => {
    if (task.id !== taskId || task.status === status) {
      return task;
    }
    const completedAt = status === 'concluída' ? (task.completedAt ?? toIsoDate(today)) : null;
    return { ...task, status, completedAt };
  });
}

/** Iniciais do primeiro e do último nome, em maiúsculas (ex.: "Ana Souza" → "AS"). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function isOpen(task: Task): boolean {
  return task.status !== 'concluída';
}

/** Data local no formato `YYYY-MM-DD`, comparável com as datas dos dados. */
function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
