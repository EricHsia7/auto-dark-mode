import { generateIdentifier } from './generate-identifier';

export function generateElementSelector(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  if (!element.id) {
    element.id = `_${generateIdentifier()}`;
  }
  const id = element.id ? `#${element.id}` : '';
  const classes = element.classList.length > 0 ? `.${Array.from(element.classList).join('.')}` : '';
  return `${tag}${id}${classes}`;
}
