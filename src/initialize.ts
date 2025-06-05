import { flattenStyleSheets, getStyles, invertStyles, stylesToString } from './lib/styles';

export function initialize(): void {
  setTimeout(() => {
    try {
      // Extract styles
      const styles = getStyles();
      console.log(0, styles);

      // Invert styles
      const invertedStyles = invertStyles(styles);
      console.log(1, invertedStyles);

      // Flatten styles
      const flattenStyles = flattenStyleSheets(invertedStyles);
      console.log(2, flattenStyles);

      // Styles String
      const string = stylesToString(flattenStyles);
      console.log(3, string);

      // Create stylesheet
      const styleSheet = document.createElement('style');
      styleSheet.textContent = string;
      document.head.appendChild(styleSheet);
    } catch (e) {
      console.log(e);
    }
  }, 5000);
}
