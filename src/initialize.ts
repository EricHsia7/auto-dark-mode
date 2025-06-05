import { flattenStyleSheets, getStyles, invertStyles, stylesToString } from './lib/styles';

export function initialize(): void {
  setTimeout(() => {
    try {
      // Extract styles
      let styles = getStyles();

      // Invert styles
      styles = invertStyles(styles);

      // Flatten styles
      styles = flattenStyleSheets(styles);

      // Create stylesheet
      const styleSheet = document.createElement('style');
      styleSheet.textContent = stylesToString(styles);
      document.head.appendChild(styleSheet);
    } catch (e) {
      console.log(e);
    }
  }, 5000);
}
