import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormPanel, FormPanelField } from './form-panel';

@Component({
  imports: [FormPanel],
  template: `
    <app-form-panel
      title="Novo cliente"
      [form]="form"
      [fields]="fields"
      [status]="status"
      [error]="error"
      (submitted)="onSubmit()"
      (closed)="onClose()"
    />
  `,
})
class HostComponent {
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    segment: new FormControl('', { nonNullable: true }),
  });

  readonly fields: FormPanelField[] = [
    { name: 'name', label: 'Nome', errors: { required: 'Informe o nome.' } },
    {
      name: 'segment',
      label: 'Segmento',
      options: [
        { value: 'vendas', label: 'Vendas' },
        { value: 'suporte', label: 'Suporte' },
      ],
    },
  ];

  status: string | null = null;
  error: string | null = null;
  onSubmit = vi.fn();
  onClose = vi.fn();
}

/** Campo de texto pelo `id` que o painel gera; o seletor exige o elemento `input`. */
function typeInto(root: HTMLElement, name: string, value: string): void {
  const field = root.querySelector<HTMLInputElement>(`input[id$="-${name}"]`);
  if (!field) {
    throw new Error(`Campo ${name} não encontrado`);
  }
  field.value = value;
  field.dispatchEvent(new Event('input'));
  field.dispatchEvent(new Event('blur'));
}

describe('FormPanel', () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const submit = () => {
      root.querySelector<HTMLButtonElement>('form button[type="submit"]')?.click();
      fixture.detectChanges();
    };
    return { fixture, root, submit };
  }

  it('mostra o título, os campos configurados e o botão Salvar no fim', () => {
    const { root } = render();

    expect(root.querySelector('h2')?.textContent).toContain('Novo cliente');
    expect(root.textContent).toContain('Nome');
    expect(root.querySelector('select')).not.toBeNull();
    expect(root.querySelector('form button[type="submit"]')?.textContent).toContain('Salvar');
  });

  it('mostra a mensagem de status acima do botão quando informada', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.status = 'Dados salvos.';
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[role="status"]')?.textContent).toContain('Dados salvos.');
  });

  it('mostra a mensagem de erro com role alert quando informada', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.error = 'Credenciais recusadas.';
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Credenciais recusadas.');
  });

  it('emite closed ao clicar no X de fechar no canto superior', () => {
    const { fixture, root } = render();
    const closeButton = root.querySelector<HTMLButtonElement>('button[aria-label="Fechar"]');

    closeButton?.click();

    expect(fixture.componentInstance.onClose).toHaveBeenCalledTimes(1);
  });

  it('não salva um formulário inválido e mostra a mensagem do erro configurado', () => {
    const { fixture, root, submit } = render();

    submit();

    expect(fixture.componentInstance.onSubmit).not.toHaveBeenCalled();
    expect(root.textContent).toContain('Informe o nome.');
  });

  it('emite submitted quando o formulário é válido', () => {
    const { fixture, root, submit } = render();

    typeInto(root, 'name', 'Ana Souza');
    submit();

    expect(fixture.componentInstance.onSubmit).toHaveBeenCalledTimes(1);
  });
});
