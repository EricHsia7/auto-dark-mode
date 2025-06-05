import { flattenStyleSheets, getStyles, invertStyles, stylesToString } from './lib/styles';

export function initialize(): void {
  // Extract styles
  const styles = getStyles();

  // Invert styles
  const invertedStyles = invertStyles(styles);

  // Flatten styles
  const flattenStyles = flattenStyleSheets(invertedStyles);

  // Styles String
  const string = stylesToString(flattenStyles);

  // Create stylesheet
  const styleSheet = document.createElement('style');
  styleSheet.textContent = string;
  document.head.appendChild(styleSheet);
}
