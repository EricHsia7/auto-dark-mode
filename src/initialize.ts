import { initializeButton } from './interface/button/index';
import { initializePanel, updateStylesheets } from './interface/panel/index';
import { inlineCSS } from './lib/inline-css';
import { isFramed } from './lib/is-framed';
import { generateCssFromStyles, getPartialStyles, getStyles, invertStyles, Styles, StylesCollection } from './lib/styles';
import { transformLayerCSS } from './lib/transform-layer-css';

let lastUpdateTime = 0;
let currentStyles = {} as Styles;

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
  currentStyles = styles;

  // Invert styles
  const invertedStyles = invertStyles(styles.stylesCollection, styles.referenceMap) as StylesCollection;

  // Generate inverted css
  const stylesheets = generateCssFromStyles(invertedStyles, false);

  if (!isFramed()) {
    // Prepare button
    initializeButton();

    // Prepare control panel
    initializePanel();
  }

  // Update stylesheets
  updateStylesheets(stylesheets);

  lastUpdateTime = new Date().getTime();

  // Listen to changes
  const observer = new MutationObserver((mutationList, observer) => {
    const now = new Date().getTime();
    if (now - lastUpdateTime > 500) {
      let shouldGetFullStyles = false;
      let shouldGetPartialStyles = false;

      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLLinkElement || (node instanceof HTMLStyleElement && node.tagName.toLowerCase() === 'style' && !node.hasAttribute('auto-dark-mode-stylesheet-name'))) {
              shouldGetFullStyles = true;
            } else if (node instanceof HTMLElement) {
              shouldGetPartialStyles = true;
            }
          });
        } else if (mutation.type === 'attributes') {
          if (mutation.attributeName === 'style') {
            shouldGetPartialStyles = true;
          }
        }
      }

      if (shouldGetFullStyles) {
        lastUpdateTime = now;
        // Extract full styles
        const styles = getStyles();
        const invertedStyles = invertStyles(styles.stylesCollection, styles.referenceMap) as StylesCollection;
        const stylesheets = generateCssFromStyles(invertedStyles, false);
        updateStylesheets(stylesheets);
      } else if (shouldGetPartialStyles) {
        lastUpdateTime = now;
        // Extract partial styles
        const styles = getPartialStyles(mutationList);
        // Patch styles
        const patchedStylesCollection = Object.assign(currentStyles.stylesCollection, styles.stylesCollection);
        const patchedReferenceMap = Object.assign(currentStyles.referenceMap, styles.referenceMap);
        currentStyles = { stylesCollection: patchedStylesCollection, referenceMap: patchedReferenceMap };
        const invertedStyles = invertStyles(patchedStylesCollection, patchedReferenceMap) as StylesCollection;
        const stylesheets = generateCssFromStyles(invertedStyles, false);
        updateStylesheets(stylesheets);
      }
    }
  });

  observer.observe(document.body, { attributes: true, childList: true, subtree: true });
}
