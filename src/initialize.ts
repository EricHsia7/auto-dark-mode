import { flattenStyles, getStyles, invertStyles, stylesToString } from './lib/styles';

export function initialize(): void {
  // Extract styles
  const styles = getStyles();
  console.log(styles);

  // Invert styles
  const invertedStyles = invertStyles(styles);

  // Flatten styles
  const flattenedStyles = flattenStyles(invertedStyles);
  console.log(flattenedStyles);

  // Styles String
  const string = stylesToString(flattenStyles);

  // Create stylesheet
  const styleSheet = document.createElement('style');
  styleSheet.textContent = string;
  document.head.appendChild(styleSheet);
}
