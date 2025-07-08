import { initializeButton } from './interface/button/index';
import { initializePanel, updateStylesheets } from './interface/panel/index';
import { generateCssFromImageItem, getImageItem, invertImageItem } from './lib/images';
import { inlineCSS } from './lib/inline-css';
import { isFramed } from './lib/is-framed';
import { generateCssFromStyles, getStyles, invertStyles, StylesCollection, StyleSheetCSSArray } from './lib/styles';
import { transformLayerCSS } from './lib/transform-layer-css';

let currentStylesheets: StyleSheetCSSArray = [];

export async function initialize() {
  if (!isFramed()) {
    // Prepare button
    initializeButton();

    // Prepare control panel
    initializePanel();
  }

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
  currentStylesheets = stylesheets;

  // Update stylesheets
  updateStylesheets(stylesheets);

  // Invert images
  const imageElements = document.querySelectorAll('img, picture source');
  for (const imageElement of imageElements) {
    getImageItem(imageElement).then((imageItem) => {
      if (typeof imageItem !== 'boolean') {
        invertImageItem(imageItem).then((invertImageItem) => {
          if (typeof invertImageItem !== 'boolean') {
            // Generate css
            const invertImageItemCSS = generateCssFromImageItem(invertImageItem);

            // Update stylesheet
            currentStylesheets.push(invertImageItemCSS);
            updateStylesheets(currentStylesheets);
          }
        });
      }
    });
  }

  const observer = new MutationObserver((mutations) => {
    const imageElementsToUpdate = [];

    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        if (mutation.target instanceof HTMLImageElement) {
          imageElementsToUpdate.push(mutation.target);
        }
      } else if (mutation.type === 'childList') {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode instanceof HTMLImageElement) {
            imageElementsToUpdate.push(addedNode);
          }
        }
      }
    }

    for (const imageElement of imageElementsToUpdate) {
      getImageItem(imageElement).then((imageItem) => {
        if (typeof imageItem !== 'boolean') {
          invertImageItem(imageItem).then((invertImageItem) => {
            if (typeof invertImageItem !== 'boolean') {
              // Generate css
              const invertImageItemCSS = generateCssFromImageItem(invertImageItem);

              // Update stylesheet
              currentStylesheets.push(invertImageItemCSS);
              updateStylesheets(currentStylesheets);
            }
          });
        }
      });
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset'],
    childList: true
  });
}
