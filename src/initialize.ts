import { flattenStyles, getStyles, invertStyles, stylesToStrings } from './lib/styles';

export function initialize(): void {
  // Extract styles
  const styles = getStyles();

  // Invert styles
  const invertedStyles = invertStyles(styles);

  // Styles String
  const strings = stylesToStrings(invertedStyles);

  // Inject stylesheets
  const fragment = new DocumentFragment();
  for (const string of strings) {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = string;
    fragment.appendChild(styleSheet);
  }
  document.documentElement.appendChild(fragment);
}
