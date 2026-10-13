import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button } from './button';

@Component({
  imports: [Button],
  template: `<app-button [loading]="loading">Salvar</app-button>`,
})
class HostComponent {
  loading = false;
}

@Component({
  imports: [Button],
  template: `<app-button variant="outline">Entrar</app-button>`,
})
class OutlineHostComponent {}

@Component({
  imports: [Button],
  template: `<app-button [iconOnly]="true" ariaLabel="Ativar modo claro">☀</app-button>`,
})
class IconOnlyHostComponent {}

describe('Button', () => {
  it('variante outline não tem preenchimento e usa borda e texto brancos', () => {
    const fixture = TestBed.createComponent(OutlineHostComponent);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.className).toContain('bg-transparent');
    expect(button.className).toContain('border-white');
    expect(button.className).toContain('text-white');
  });

  it('renderiza o conteúdo projetado com type="button" por padrão', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.textContent).toContain('Salvar');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.disabled).toBe(false);
  });

  it('fica desabilitado e sinaliza aria-busy durante o carregamento', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.loading = true;
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('botão só com ícone fica quadrado e usa o aria-label', () => {
    const fixture = TestBed.createComponent(IconOnlyHostComponent);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.className).toContain('aspect-square');
    expect(button.getAttribute('aria-label')).toBe('Ativar modo claro');
  });

  it('tem cursor de mão e animação de hover, desligada com movimento reduzido e quando desabilitado', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const classes: DOMTokenList = fixture.nativeElement.querySelector('button').classList;
    expect(classes).toContain('cursor-pointer');
    expect(classes).toContain('hover:-translate-y-px');
    expect(classes).toContain('motion-reduce:hover:translate-y-0');
    expect(classes).toContain('disabled:cursor-not-allowed');
    expect(classes).toContain('disabled:hover:translate-y-0');
  });
});
