import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Skeleton, SkeletonShape } from './skeleton';

@Component({
  imports: [Skeleton],
  template: `<app-skeleton class="h-4 w-24" [shape]="shape()" />`,
})
class HostComponent {
  readonly shape = signal<SkeletonShape>('block');
}

describe('Skeleton', () => {
  it('é decorativo, pulsa com a cor de token e para com movimento reduzido', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector('app-skeleton');
    const bar = host.querySelector('span') as HTMLElement;

    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.classList).toContain('h-4');
    expect(bar.classList).toContain('animate-pulse');
    expect(bar.classList).toContain('bg-crm-border');
    expect(bar.classList).toContain('motion-reduce:animate-none');
    expect(bar.classList).toContain('rounded-crm');
  });

  it('usa o raio da forma pedida', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.shape.set('circle');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('span').classList).toContain('rounded-full');
  });
});
