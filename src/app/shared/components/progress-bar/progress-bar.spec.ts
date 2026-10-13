import { TestBed } from '@angular/core/testing';
import { ProgressBar } from './progress-bar';

describe('ProgressBar', () => {
  function render(value: number, tone?: 'primary' | 'success') {
    const fixture = TestBed.createComponent(ProgressBar);
    fixture.componentRef.setInput('value', value);
    fixture.componentRef.setInput('label', 'Andamento');
    if (tone) fixture.componentRef.setInput('tone', tone);
    fixture.detectChanges();
    const bar = (fixture.nativeElement as HTMLElement).querySelector('[role="progressbar"]')!;
    return { bar, fill: bar.firstElementChild as HTMLElement };
  }

  it('expõe valor e nome acessível e preenche a largura', () => {
    const { bar, fill } = render(40);

    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    expect(bar.getAttribute('aria-label')).toBe('Andamento');
    expect(fill.style.width).toBe('40%');
    expect(fill.className).toContain('bg-crm-primary');
  });

  it('limita o valor entre 0 e 100 e aceita o tom de sucesso', () => {
    const { bar, fill } = render(140, 'success');

    expect(bar.getAttribute('aria-valuenow')).toBe('100');
    expect(fill.className).toContain('bg-crm-success');
  });
});
