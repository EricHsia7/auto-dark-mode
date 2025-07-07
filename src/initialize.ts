import { initializeButton } from './interface/button/index';
import { initializePanel } from './interface/panel/index';
import { generateCSSFromImageItems, getImageItems, invertImageItems } from './lib/images';
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

  try {
    // Get images
    const imageitems = await getImageItems();

    // Invert images
    const invertedImageItems = await invertImageItems(imageitems);

    // Generate css
    const invertImageItemsCSS = generateCSSFromImageItems(invertedImageItems);

    // Inject css
    const imageItemsStyle = document.createElement('style');
    imageItemsStyle.textContent = invertImageItemsCSS;
    // imageItemsStyle.setAttribute('auto-dark-mode-stylesheet-name', name);
    document.documentElement.appendChild(imageItemsStyle);
  } catch (e) {
    console.log(e);
  }

  if (!isFramed()) {
    // Prepare button
    initializeButton();

    // Prepare control panel
    initializePanel(strings);
  }

  const autoDarkModeInitializedEvent = new CustomEvent('autodarkmodeinitialized', {});
  document.dispatchEvent(autoDarkModeInitializedEvent);
}
