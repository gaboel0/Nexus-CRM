import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TextLink } from './text-link';

@Component({
  imports: [TextLink],
  template: `<app-text-link to="/esqueci-minha-senha">Esqueci minha senha</app-text-link>`,
})
class HostComponent {}

describe('TextLink', () => {
  it('renderiza um link para o destino com o texto projetado e a cor do token de link', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('href')).toBe('/esqueci-minha-senha');
    expect(link.textContent?.trim()).toBe('Esqueci minha senha');
    expect(link.classList).toContain('text-crm-link');
  });
});
