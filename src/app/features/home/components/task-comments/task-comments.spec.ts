import { TestBed } from '@angular/core/testing';
import { TaskComment } from '../../../../core/models/project.models';
import { TaskComments } from './task-comments';

const COMMENTS: TaskComment[] = [
  {
    id: 1,
    taskId: 2,
    authorName: 'Carla Dias',
    content: 'Layout pronto.',
    createdAt: '2026-10-07T10:15:00',
  },
];

describe('TaskComments', () => {
  function setup(comments: readonly TaskComment[] | undefined) {
    const fixture = TestBed.createComponent(TaskComments);
    fixture.componentRef.setInput('comments', comments);
    fixture.detectChanges();
    const sent: string[] = [];
    fixture.componentInstance.commentSubmitted.subscribe((content) => sent.push(content));
    const root = fixture.nativeElement as HTMLElement;
    const textarea = root.querySelector('textarea')!;
    const type = (value: string) => {
      textarea.value = value;
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    const submit = () => {
      root.querySelector('form')!.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
    };
    return { fixture, root, textarea, sent, type, submit };
  }

  it('mostra skeleton enquanto carrega', () => {
    const { root } = setup(undefined);

    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Carregando os comentários',
    );
  });

  it('lista autor, data e texto; sem comentários mostra o estado vazio', () => {
    const text = setup(COMMENTS).root.textContent ?? '';

    expect(text).toContain('Comentários (1)');
    expect(text).toContain('Carla Dias');
    expect(text).toContain('07/10/2026 às 10:15');
    expect(text).toContain('Layout pronto.');
    expect(setup([]).root.textContent).toContain('Nenhum comentário ainda');
  });

  it('não envia comentário vazio e mostra o erro no campo', () => {
    const { textarea, sent, type, submit } = setup(COMMENTS);

    type('   ');
    submit();

    expect(sent).toEqual([]);
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
  });

  it('envia o texto sem espaços nas pontas e limpa o campo no reset', () => {
    const { fixture, textarea, sent, type, submit } = setup(COMMENTS);

    type('  Concordo com o layout.  ');
    submit();
    expect(sent).toEqual(['Concordo com o layout.']);

    fixture.componentInstance.reset();
    fixture.detectChanges();
    expect(textarea.value).toBe('');
  });
});
