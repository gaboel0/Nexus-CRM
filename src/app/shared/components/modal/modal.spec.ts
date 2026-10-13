import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Modal } from './modal';

@Component({
  imports: [Modal],
  template: `
    <app-modal [open]="open()" title="Excluir cliente" (closed)="onClosed()">
      <p>Essa ação não pode ser desfeita.</p>
    </app-modal>
  `,
})
class HostComponent {
  open = signal(true);
  onClosed = vi.fn();
}

@Component({
  imports: [Modal],
  template: `<app-modal [open]="true" title="Painel" placement="end" />`,
})
class EndPlacementHostComponent {}

describe('Modal', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renderiza um diálogo acessível com título e conteúdo projetado', () => {
    const fixture = setup();
    const dialog: HTMLElement = fixture.nativeElement.querySelector('[role="dialog"]');

    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(dialog.textContent).toContain('Excluir cliente');
    expect(dialog.textContent).toContain('Essa ação não pode ser desfeita.');
  });

  it('na posição end fica à direita, sem escurecer o fundo', () => {
    const fixture = TestBed.createComponent(EndPlacementHostComponent);
    fixture.detectChanges();
    const dialog: HTMLElement = fixture.nativeElement.querySelector('[role="dialog"]');
    const overlay = dialog.parentElement as HTMLElement;

    expect(overlay.classList).toContain('justify-end');
    expect(overlay.classList).not.toContain('bg-crm-text/40');
    expect(dialog.classList).toContain('max-w-md');
  });

  it('na posição end é um painel não modal: a página atrás continua clicável', () => {
    const fixture = TestBed.createComponent(EndPlacementHostComponent);
    fixture.detectChanges();
    const dialog: HTMLElement = fixture.nativeElement.querySelector('[role="dialog"]');
    const overlay = dialog.parentElement as HTMLElement;

    expect(dialog.getAttribute('aria-modal')).toBe('false');
    expect(overlay.classList).toContain('pointer-events-none');
    expect(dialog.classList).toContain('pointer-events-auto');
  });

  it('na posição end não tem cabeçalho próprio: o título fica só para leitores de tela', () => {
    const fixture = TestBed.createComponent(EndPlacementHostComponent);
    fixture.detectChanges();
    const dialog: HTMLElement = fixture.nativeElement.querySelector('[role="dialog"]');
    const heading = dialog.querySelector('h2');

    expect(heading?.textContent).toContain('Painel');
    expect(heading?.classList).toContain('sr-only');
    expect(dialog.querySelector('button[aria-label="Fechar"]')).toBeNull();
  });

  it('não renderiza nada quando fechado', () => {
    const fixture = setup();
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('emite closed ao pressionar Esc', () => {
    const fixture = setup();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.onClosed).toHaveBeenCalledTimes(1);
  });

  it('emite closed ao clicar no botão de fechar', () => {
    const fixture = setup();
    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Fechar"]',
    );
    closeButton.click();

    expect(fixture.componentInstance.onClosed).toHaveBeenCalledTimes(1);
  });
});
