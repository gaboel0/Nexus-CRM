/**
 * Anima um elemento com a Web Animations API. Não anima quando o usuário pede movimento reduzido
 * (`prefers-reduced-motion`) ou quando o navegador não tem a API, como no jsdom dos testes.
 */
export function animateElement(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
): Animation | null {
  if (typeof element.animate !== 'function' || prefersReducedMotion()) {
    return null;
  }

  return element.animate(keyframes, options);
}

/** Indica se o usuário pediu para reduzir animações no sistema operacional. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
