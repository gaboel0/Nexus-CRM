import { TestBed } from '@angular/core/testing';
import { CityScene } from './city-scene';

describe('CityScene', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CityScene] }).compileComponents();
  });

  // O jsdom não tem WebGL: o componente deve ficar sem canvas, sem erros, e liberar tudo ao sair.
  it('não desenha canvas quando WebGL não está disponível', () => {
    const fixture = TestBed.createComponent(CityScene);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('canvas')).toBeNull();
  });

  it('pode ser destruído sem erros', () => {
    const fixture = TestBed.createComponent(CityScene);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });

  it('aceita a troca de vista mesmo sem cena montada', () => {
    const fixture = TestBed.createComponent(CityScene);
    fixture.detectChanges();

    expect(() => {
      fixture.componentInstance.setView('side');
      fixture.componentInstance.setView('aerial');
    }).not.toThrow();
  });

  it('aceita a troca de tema mesmo sem cena montada', () => {
    const fixture = TestBed.createComponent(CityScene);
    fixture.detectChanges();

    expect(() => {
      fixture.componentInstance.setTheme('light');
      fixture.componentInstance.setTheme('dark');
    }).not.toThrow();
  });
});
