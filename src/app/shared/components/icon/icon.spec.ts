import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Icon, IconSize, IconWeight } from './icon';

@Component({
  imports: [Icon],
  template: `<app-icon name="mail" [size]="size()" [weight]="weight()" [filled]="filled()" />`,
})
class HostComponent {
  readonly size = signal<IconSize>('md');
  readonly weight = signal<IconWeight>('light');
  readonly filled = signal(false);
}

describe('Icon', () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const glyph = (): HTMLElement => fixture.nativeElement.querySelector('span');
    return { fixture, glyph };
  }

  it('renderiza o ligature decorativo com traço fino e tamanho médio por padrão', () => {
    const { glyph } = render();

    expect(glyph().textContent?.trim()).toBe('mail');
    expect(glyph().getAttribute('aria-hidden')).toBe('true');
    expect(glyph().classList).toContain('text-xl');
    expect(glyph().style.getPropertyValue('font-variation-settings')).toContain("'wght' 300");
    expect(glyph().style.getPropertyValue('font-variation-settings')).toContain("'FILL' 0");
  });

  it('aplica tamanho, espessura e preenchimento pedidos', () => {
    const { fixture, glyph } = render();

    fixture.componentInstance.size.set('lg');
    fixture.componentInstance.weight.set('medium');
    fixture.componentInstance.filled.set(true);
    fixture.detectChanges();

    expect(glyph().classList).toContain('text-2xl');
    expect(glyph().style.getPropertyValue('font-variation-settings')).toContain("'wght' 500");
    expect(glyph().style.getPropertyValue('font-variation-settings')).toContain("'FILL' 1");
    expect(glyph().style.getPropertyValue('font-variation-settings')).toContain("'opsz' 24");
  });
});
