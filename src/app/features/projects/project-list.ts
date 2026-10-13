import { Project, ProjectTeam, Task, TeamMember } from '../../core/models/project.models';
import { ProjectProgress, projectProgress } from './project-progress';

/** Projeto no grid da listagem: dados do projeto, nome do líder e andamento. */
export interface ProjectListItem extends ProjectProgress {
  readonly project: Project;
  readonly leadName: string | null;
}

/** Equipe com os projetos dela. `team` é `null` no grupo de projetos sem equipe conhecida. */
export interface ProjectGroup {
  readonly team: ProjectTeam | null;
  readonly projects: readonly ProjectListItem[];
}

/**
 * Agrupa os projetos por equipe, na ordem das equipes. Dentro de cada equipe, abertos primeiro,
 * pelo prazo mais próximo; concluídos no fim. Equipes sem projetos aparecem com lista vazia;
 * projetos cuja equipe não existe vão para um grupo final "sem equipe", só quando houver algum.
 */
export function buildProjectGroups(
  teams: readonly ProjectTeam[],
  projects: readonly Project[],
  tasks: readonly Task[],
  members: readonly TeamMember[],
): ProjectGroup[] {
  const item = (project: Project): ProjectListItem => ({
    project,
    leadName: members.find((m) => m.id === project.leadId)?.name ?? null,
    ...projectProgress(project.id, tasks),
  });
  const sorted = [...projects].sort(
    (a, b) =>
      Number(a.status === 'concluído') - Number(b.status === 'concluído') ||
      a.dueDate.localeCompare(b.dueDate),
  );

  const groups: ProjectGroup[] = teams.map((team) => ({
    team,
    projects: sorted.filter((project) => project.teamId === team.id).map(item),
  }));
  const orphans = sorted.filter((project) => !teams.some((team) => team.id === project.teamId));
  if (orphans.length) {
    groups.push({ team: null, projects: orphans.map(item) });
  }
  return groups;
}
