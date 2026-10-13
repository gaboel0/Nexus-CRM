import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Card } from './card';

@Component({
  imports: [Card],
  template: `
    <app-card id="plain" class="extra" title="Resumo"><p>Conteúdo</p></app-card>
    <app-card id="fill" [fill]="true" [padded]="false"><p>Lista</p></app-card>
  `,
})
class HostComponent {}

describe('Card', () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    return {
      plain: root.querySelector('#plain') as HTMLElement,
      fill: root.querySelector('#fill') as HTMLElement,
    };
  }

  it('por padrão é um bloco com título e corpo com padding, mantendo as classes do host', () => {
    const { plain } = render();

    expect(plain.classList).toContain('block');
    expect(plain.classList).toContain('extra');
    expect(plain.querySelector('h2')?.textContent).toContain('Resumo');
    expect(plain.querySelector('section > div')?.classList).toContain('p-5');
  });

  it('com fill, ocupa a altura do contêiner e o corpo vira coluna flexível', () => {
    const { fill } = render();
    const section = fill.querySelector('section') as HTMLElement;
    const body = fill.querySelector('section > div') as HTMLElement;

    expect(fill.classList).toContain('flex');
    expect(fill.classList).not.toContain('block');
    expect(section.classList).toContain('flex-1');
    expect(body.classList).toContain('min-h-0');
    expect(body.classList).not.toContain('p-5');
    expect(fill.querySelector('h2')).toBeNull();
  });
});
