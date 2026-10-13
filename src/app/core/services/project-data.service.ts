import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  MOCK_PROJECT_TEAMS,
  MOCK_PROJECTS,
  MOCK_TASK_COMMENTS,
  MOCK_TASKS,
  MOCK_TEAM,
} from '../mocks/mock-data';
import { Project, ProjectTeam, Task, TaskComment, TeamMember } from '../models/project.models';

/**
 * Fonte de dados mockada de projetos, tarefas e equipe. Retorna Observables para facilitar a troca
 * por HttpClient depois.
 *
 * Comentários novos ficam só na memória do serviço: somem ao recarregar a página.
 */
@Injectable({ providedIn: 'root' })
export class ProjectDataService {
  private readonly latency = 300;
  private comments: TaskComment[] = [...MOCK_TASK_COMMENTS];

  getProjects(): Observable<Project[]> {
    return of(MOCK_PROJECTS).pipe(delay(this.latency));
  }

  /** Equipes que agrupam os projetos. */
  getProjectTeams(): Observable<ProjectTeam[]> {
    return of(MOCK_PROJECT_TEAMS).pipe(delay(this.latency));
  }

  getTasks(): Observable<Task[]> {
    return of(MOCK_TASKS).pipe(delay(this.latency));
  }

  getTeam(): Observable<TeamMember[]> {
    return of(MOCK_TEAM).pipe(delay(this.latency));
  }

  /** Comentários da tarefa, do mais antigo ao mais recente. */
  getTaskComments(taskId: number): Observable<TaskComment[]> {
    const comments = this.comments
      .filter((comment) => comment.taskId === taskId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return of(comments).pipe(delay(this.latency));
  }

  addTaskComment(taskId: number, authorName: string, content: string): Observable<TaskComment> {
    const comment: TaskComment = {
      id: Math.max(0, ...this.comments.map((c) => c.id)) + 1,
      taskId,
      authorName,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    this.comments = [...this.comments, comment];
    return of(comment).pipe(delay(this.latency));
  }
}
