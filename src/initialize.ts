import { getStyles, invertStyles, stylesToString } from './lib/styles';

export function initialize(): void {
  setTimeout(() => {
    // Extract styles
    let styles = getStyles();

    // Invert styles
    styles = invertStyles(styles);

    // Create stylesheet
    const styleSheet = document.createElement('style');
    styleSheet.textContent = stylesToString(styles);
    document.head.appendChild(styleSheet);
  }, 5000);
}
