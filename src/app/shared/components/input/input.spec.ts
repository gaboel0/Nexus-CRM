import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Input, InputType } from './input';

@Component({
  imports: [Input, ReactiveFormsModule],
  template: `<app-input
    id="email"
    label="E-mail"
    [type]="type()"
    [formControl]="control"
    [error]="error()"
  />`,
})
class HostComponent {
  control = new FormControl('', { nonNullable: true });
  error = signal<string | null>(null);
  type = signal<InputType>('text');
}

describe('Input', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    return { fixture, input };
  }

  it('associa o label ao campo pelo id', () => {
    const { fixture, input } = setup();
    const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
    expect(label.htmlFor).toBe('email');
    expect(input.id).toBe('email');
  });

  it('usa o label como placeholder quando nenhum placeholder é informado', () => {
    const { input } = setup();
    expect(input.placeholder).toBe('E-mail');
  });

  it('mostra o ícone padrão do tipo à esquerda', () => {
    const { fixture } = setup();
    fixture.componentInstance.type.set('email');
    fixture.detectChanges();

    const icon: HTMLElement = fixture.nativeElement.querySelector('app-icon span');
    expect(icon.textContent?.trim()).toBe('mail');
  });

  it('atualiza o FormControl ao digitar', () => {
    const { fixture, input } = setup();
    input.value = 'ana@crm.com';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('ana@crm.com');
  });

  it('exibe a mensagem de erro e marca aria-invalid', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.error.set('E-mail inválido');
    fixture.detectChanges();

    const message: HTMLElement = fixture.nativeElement.querySelector('#email-message');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('email-message');
    expect(message.textContent).toContain('E-mail inválido');
  });

  it('fica desabilitado quando o FormControl é desabilitado', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    expect(input.disabled).toBe(true);
  });

  it('focus() leva o foco ao campo', () => {
    const { fixture, input } = setup();
    const field: Input = fixture.debugElement.query(By.directive(Input)).componentInstance;
    field.focus();

    expect(document.activeElement).toBe(input);
  });
});
