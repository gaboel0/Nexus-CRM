import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar, SidebarItem } from './sidebar';

@Component({
  imports: [Sidebar],
  template: `
    <app-sidebar [items]="items" userName="Admin" userRole="admin" (logout)="onLogout()" />
  `,
})
class HostComponent {
  readonly items: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/home' },
    { label: 'Clientes', icon: 'group', route: '/clientes' },
  ];
  onLogout = vi.fn();
}

describe('Sidebar', () => {
  function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const aside = () => root.querySelector('aside') as HTMLElement;
    const toggle = () => root.querySelector<HTMLButtonElement>('button[aria-expanded]');
    return { fixture, root, aside, toggle };
  }

  it('começa recolhida: só ícones, com os nomes disponíveis para leitores de tela', () => {
    const { root, aside, toggle } = render();
    const links = root.querySelectorAll<HTMLAnchorElement>('nav a');

    expect(aside().classList).toContain('w-16');
    expect(toggle()?.getAttribute('aria-expanded')).toBe('false');
    expect(links).toHaveLength(2);
    expect(links[1].getAttribute('href')).toBe('/clientes');
    expect(links[0].querySelector('span.sr-only')?.textContent).toContain('Dashboard');
    expect(links[0].getAttribute('title')).toBe('Dashboard');
  });

  it('expande ao clicar no topo, mostrando rótulos e usuário, e recolhe de novo', () => {
    const { fixture, root, aside, toggle } = render();

    toggle()?.click();
    fixture.detectChanges();

    expect(aside().classList).toContain('w-60');
    expect(toggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(root.querySelector('nav span.sr-only')).toBeNull();
    expect(root.textContent).toContain('Admin');

    toggle()?.click();
    fixture.detectChanges();
    expect(aside().classList).toContain('w-16');
  });

  it('reserva no layout a largura da sidebar e a aumenta ao expandir, empurrando o conteúdo', () => {
    const { fixture, root, toggle } = render();
    const host = root.querySelector('app-sidebar') as HTMLElement;

    expect(host.classList).toContain('w-20');
    expect(host.classList).not.toContain('md:w-64');

    toggle()?.click();
    fixture.detectChanges();

    // Abaixo de md o espaço continua o da recolhida (a expandida passa por cima no celular).
    expect(host.classList).toContain('md:w-64');
    expect(host.classList).toContain('w-20');
  });

  it('emite logout ao clicar em Sair', () => {
    const { fixture, root } = render();
    const logout = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
      button.textContent?.includes('Sair'),
    );

    logout?.click();

    expect(fixture.componentInstance.onLogout).toHaveBeenCalledTimes(1);
  });
});
