/** Estado visual de um campo de formulário. */
export type FieldState = 'default' | 'error' | 'success';

/** Altura padrão de campos de linha única (design system: 42px). */
export const FIELD_HEIGHT = 'h-crm-input';

const FIELD_BASE = [
  'w-full rounded-crm border bg-crm-surface text-sm text-crm-text',
  'placeholder:font-light placeholder:text-crm-muted outline-none transition-colors',
  'focus:shadow-crm-focus',
  'disabled:cursor-not-allowed disabled:bg-crm-canvas disabled:text-crm-muted',
].join(' ');

const FIELD_STATE: Record<FieldState, string> = {
  default:
    'border-crm-border hover:border-crm-border-hover focus:border-crm-primary disabled:hover:border-crm-border',
  error:
    'border-crm-error hover:border-crm-error focus:border-crm-error focus:shadow-crm-error-focus',
  success: 'border-crm-success hover:border-crm-success focus:border-crm-success',
};

/** Combina a base, o estado e o layout (altura e espaçamentos) de um campo. */
export function fieldClasses(state: FieldState, layout: string): string {
  return [FIELD_BASE, FIELD_STATE[state], layout].join(' ');
}
