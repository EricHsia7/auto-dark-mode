import { initializeButton } from './interface/button/index';
import { initializePanel, updateStylesheets } from './interface/panel/index';
import { inlineCSS } from './lib/inline-css';
import { isFramed } from './lib/is-framed';
import { generateCssFromStyles, getStyles, invertStyles, StylesCollection } from './lib/styles';
import { transformLayerCSS } from './lib/transform-layer-css';

let lastUpdateTime = 0;

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
    if (
      mutationList.some((mutation) => {
        const type = mutation.type;
        if (type === 'childList') {
          return true;
        } else if (type === 'attributes') {
          if (mutation.attributeName === 'style') {
            return true;
          }
        }
      })
    ) {
      const now = new Date().getTime();
      if (now - lastUpdateTime > 500) {
        lastUpdateTime = now;
        // Extract styles
        const styles = getStyles();

        // Invert styles
        const invertedStyles = invertStyles(styles.stylesCollection, styles.referenceMap) as StylesCollection;

        // Generate inverted css
        const stylesheets = generateCssFromStyles(invertedStyles, false);

        // Update stylesheets
        updateStylesheets(stylesheets);
      }
    }

    /*
    for (const mutation of mutationList) {
      switch (mutation.type) {
        case 'childList':
          break;
        case 'attributes':     
          break;
        default:
          break;
      }
    }
    */
  });

  observer.observe(document.body, { attributes: true, childList: true, subtree: true });
}
