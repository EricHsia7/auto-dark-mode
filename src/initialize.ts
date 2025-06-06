import { getStyles, invertStyles, stylesToStrings } from './lib/styles';

export function initialize(): void {
  // Add mask
  const mask = document.createElement('div');
  mask.classList.add('auto_dark_mode_mask');
  mask.addEventListener(
    'transitionend',
    function (event: Event) {
      const target = event.target as HTMLElement;
      target.remove();
    },
    { once: true }
  );
  document.documentElement.appendChild(mask);

  // Extract styles
  const styles = getStyles();

  // Invert styles
  const invertedStyles = invertStyles(styles);

  // Styles String
  const strings = stylesToStrings(invertedStyles, false);

  // Inject stylesheets
  const fragment = new DocumentFragment();
  for (const string of strings) {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = string;
    fragment.appendChild(styleSheet);
  }
  document.documentElement.appendChild(fragment);

  // Remove mask
  document.querySelector('.auto_dark_mode_mask')?.classList.add('auto_dark_mode_fade_out');
}
