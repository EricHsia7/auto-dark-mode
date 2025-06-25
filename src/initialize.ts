import { initializeButton } from './interface/button/index';
import { initializePanel } from './interface/panel/index';
import { inlineCSS } from './lib/inline-css';
import { isFramed } from './lib/is-framed';
import { generateCssFromStyles, getStyles, invertStyles, StylesCollection } from './lib/styles';
import { transformLayerCSS } from './lib/transform-layer-css';

export async function initialize() {
  // Transform layers in style tags
  const styleTags = document.querySelectorAll('style') as NodeListOf<HTMLStyleElement>;
  for (const styleTag of styleTags) {
    const cssText = styleTag.textContent;
    const transformedCSS = transformLayerCSS(cssText);
    styleTag.textContent = transformedCSS;
  }

  // Inline external/foreign CSS
  await inlineCSS();

  // Extract styles
  const styles = getStyles();

  // Invert styles
  const invertedStyles = invertStyles(styles.stylesCollection, styles.referenceMap) as StylesCollection;

  // Generate inverted css
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
    initializePanel(strings);
  }
}
