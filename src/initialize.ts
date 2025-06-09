import { initializeButton } from './interface/button/index';
import { initializeControlPanel } from './interface/control-panel/index';
import { inlineCSS } from './lib/inline-css';
import { isFramed } from './lib/is-framed';
import { getStyles, invertStyles, generateCssFromStyles, StylesCollection } from './lib/styles';

export async function initialize(): void {
  // Inline external/foreign CSS
  await inlineCSS();

  // Extract styles
  const styles = getStyles();

  // Invert styles
  const invertedStyles = invertStyles(styles.stylesCollection, styles.referenceMap) as StylesCollection;

  // Styles String
  const strings = generateCssFromStyles(invertedStyles, false);

  // Inject stylesheets
  const fragment = new DocumentFragment();
  for (const string of strings) {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = string.css;
    styleSheet.setAttribute('auto-dark-mode-stylesheet-name', string.name);
    fragment.appendChild(styleSheet);
  }
  document.documentElement.appendChild(fragment);

  if (!isFramed()) {
    // Prepare button
    initializeButton();

    // Prepare control panel
    initializeControlPanel(strings);
  }
}
