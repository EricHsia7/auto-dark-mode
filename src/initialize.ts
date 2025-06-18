import { initializeButton } from './interface/button/index';
import { initializeControlPanel } from './interface/control-panel/index';
import { inlineCSS } from './lib/inline-css';
import { isFramed } from './lib/is-framed';
import { generateCssFromStyles, getStyles, invertStyles, StylesCollection } from './lib/styles';

export async function initialize() {
  const t0 = performance.now();
  // Inline external/foreign CSS
  await inlineCSS();

  const t1 = performance.now();
  // Extract styles
  const styles = getStyles();

  const t2 = performance.now();
  // Invert styles
  const invertedStyles = invertStyles(styles.stylesCollection, styles.referenceMap) as StylesCollection;

  const t3 = performance.now();
  // Generate inverted css
  const strings = generateCssFromStyles(invertedStyles, false);

  const t4 = performance.now();
  // Inject stylesheets
  const fragment = new DocumentFragment();
  for (const string of strings) {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = string.css;
    styleSheet.setAttribute('auto-dark-mode-stylesheet-name', string.name);
    fragment.appendChild(styleSheet);
  }
  document.documentElement.appendChild(fragment);

  const t5 = performance.now();
  console.log(t0, t1, t2, t3, t4, t5);
  if (!isFramed()) {
    // Prepare button
    initializeButton();

    // Prepare control panel
    initializeControlPanel(strings);
  }
}
