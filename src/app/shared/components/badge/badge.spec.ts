import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Badge } from './badge';

@Component({
  imports: [Badge],
  template: `<app-badge id="default">planejamento</app-badge>
    <app-badge id="error" tone="error">pausado</app-badge>`,
})
class HostComponent {}

describe('Badge', () => {
  it('mostra o texto com as cores do tom (neutro por padrão)', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const neutral = root.querySelector('#default span')!;
    const error = root.querySelector('#error span')!;

    expect(neutral.textContent).toBe('planejamento');
    expect(neutral.className).toContain('text-crm-muted');
    expect(error.textContent).toBe('pausado');
    expect(error.className).toContain('text-crm-error');
  });
});
