import { generateIdentifier } from './lib/generate-identifier';
import { getStyles, invertStyles, stylesToStrings } from './lib/styles';

export function initialize(): void {
  // Add transition
  const identifier = `_${generateIdentifier()}`;
  const transitionStyleTag = document.createElement('style');
  transitionStyleTag.textContent = '* {transition: color 0.5s ease, background-color 0.5s ease, border-top-color 0.5s ease, border-left-color 0.5s ease, border-right-color 0.5s ease, border-bottom-color 0.5s ease;}';
  transitionStyleTag.id = identifier;
  document.documentElement.appendChild(transitionStyleTag);

  // Extract styles
  const styles = getStyles();

  // Invert styles
  const invertedStyles = invertStyles(styles.styles, styles.referenceMap);

  // Styles String
  const strings = stylesToStrings(invertedStyles, false);

  // Inject stylesheets
  const fragment = new DocumentFragment();
  for (const string of strings) {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = string.css;
    styleSheet.setAttribute('auto-dark-mode-stylesheet-name', string.name);
    fragment.appendChild(styleSheet);
  }
  document.documentElement.appendChild(fragment);

  // Remove transition
  setTimeout(function () {
    document.querySelector(`#${identifier}`)?.remove();
  }, 1000);
}
