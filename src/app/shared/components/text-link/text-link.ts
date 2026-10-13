import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Link de texto para navegação interna (ex.: "Esqueci minha senha"). Cor pelo token `crm-link`,
 * que acompanha o tema; sublinhado no hover; anel de foco do design system.
 */
@Component({
  selector: 'app-text-link',
  imports: [RouterLink],
  templateUrl: './text-link.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextLink {
  /** Caminho de destino no roteador, por exemplo `/esqueci-minha-senha`. */
  readonly to = input.required<string>();
}
