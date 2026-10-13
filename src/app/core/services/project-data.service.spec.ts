import { TestBed } from '@angular/core/testing';
import { MOCK_PROJECT_TEAMS, MOCK_PROJECTS, MOCK_TASKS, MOCK_TEAM } from '../mocks/mock-data';
import { ProjectDataService } from './project-data.service';

describe('ProjectDataService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
  });

  afterEach(() => vi.useRealTimers());

  it('entrega projetos, tarefas e equipe mockados após a latência simulada', () => {
    const service = TestBed.inject(ProjectDataService);
    const projects = vi.fn();
    const tasks = vi.fn();
    const team = vi.fn();
    const projectTeams = vi.fn();

    service.getProjects().subscribe(projects);
    service.getTasks().subscribe(tasks);
    service.getTeam().subscribe(team);
    service.getProjectTeams().subscribe(projectTeams);
    expect(projects).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(projects).toHaveBeenCalledWith(MOCK_PROJECTS);
    expect(tasks).toHaveBeenCalledWith(MOCK_TASKS);
    expect(team).toHaveBeenCalledWith(MOCK_TEAM);
    expect(projectTeams).toHaveBeenCalledWith(MOCK_PROJECT_TEAMS);
  });

  it('lista os comentários de uma tarefa em ordem cronológica', () => {
    const service = TestBed.inject(ProjectDataService);
    const comments = vi.fn();

    service.getTaskComments(2).subscribe(comments);
    vi.advanceTimersByTime(300);

    expect(comments.mock.calls[0][0].map((c: { id: number }) => c.id)).toEqual([1, 2]);
  });

  it('adiciona um comentário (sem espaços nas pontas) e o inclui na lista da tarefa', () => {
    const service = TestBed.inject(ProjectDataService);
    const added = vi.fn();
    const comments = vi.fn();

    service.addTaskComment(5, 'Ana Souza', '  Posso pegar esta.  ').subscribe(added);
    vi.advanceTimersByTime(300);
    service.getTaskComments(5).subscribe(comments);
    vi.advanceTimersByTime(300);

    expect(added).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: 5, authorName: 'Ana Souza', content: 'Posso pegar esta.' }),
    );
    expect(comments).toHaveBeenCalledWith([added.mock.calls[0][0]]);
  });
});
