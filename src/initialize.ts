import { initializeButton } from './interface/button/index';
import { initializePanel, updateStylesheets } from './interface/panel/index';
import { inlineCSS } from './lib/inline-css';
import { isFramed } from './lib/is-framed';
import { generateCssFromStyles, getStyles, invertStyles, Styles, StylesCollection } from './lib/styles';
import { transformLayerCSS } from './lib/transform-layer-css';

let lastUpdateTime = 0;
let currentStyles = {} as Styles;
let updating = false;

export async function initialize() {
  updating = true;

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
  updating = false;

  // Listen to changes
  const observer = new MutationObserver(function (mutationList, observer) {
    handleMutation(mutationList, observer);
  });

  observer.observe(document.body, { attributes: true, childList: true, subtree: true });
}

async function handleMutation(mutationList, observer) {
  if (!updating) {
    let needUpdate = false;
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLLinkElement || (node instanceof HTMLStyleElement && node.tagName.toLowerCase() === 'style' && !node.hasAttribute('auto-dark-mode-stylesheet-name'))) {
            needUpdate = true;
            break;
          } else if (node instanceof HTMLElement) {
            needUpdate = true;
            break;
          }
        }
      }
    }
    if (needUpdate) {
      updating = true;
      const now = new Date().getTime();
      lastUpdateTime = now;

      // if (now - lastUpdateTime > 300) {
      /*
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
      */
      // Inline external css
      await inlineCSS();

      // Extract styles
      const styles = getStyles();

      // Patch styles
      const patchedStylesCollection = Object.assign({}, currentStyles.stylesCollection || {}, styles.stylesCollection);
      const patchedReferenceMap = Object.assign({}, currentStyles.referenceMap || {}, styles.referenceMap);
      currentStyles = { stylesCollection: patchedStylesCollection, referenceMap: patchedReferenceMap };

      // Invert styles
      const invertedStyles = invertStyles(patchedStylesCollection, patchedReferenceMap) as StylesCollection;

      // Generate css
      const stylesheets = generateCssFromStyles(invertedStyles, false);

      // Apply updates
      updateStylesheets(stylesheets);

      updating = false;
      return;
    }
    // }
  } else {
    return;
  }
}
