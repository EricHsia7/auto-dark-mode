import { getStyles, invertStyles } from './lib/styles';

export function initialize(): void {
  // Extract styles
  let styles = getStyles();

  // Invert styles
  invertStyles(styles);

  // Create stylesheet
}
