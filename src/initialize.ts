import { flattenStyles, getStyles, invertStyles, stylesToString } from './lib/styles';

export function initialize(): void {
  // Extract styles
  const styles = getStyles();

  // Invert styles
  const invertedStyles = invertStyles(styles);

  // Flatten styles
  const flattenedStyles = flattenStyles(invertedStyles);

  // Styles String
  const string = stylesToString(flattenedStyles);

  // Create stylesheet
  const styleSheet = document.createElement('style');
  styleSheet.textContent = string;
  document.body.appendChild(styleSheet);
}
