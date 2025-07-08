import { initializeButton } from './interface/button/index';
import { initializePanel, updateStylesheets } from './interface/panel/index';
import { deepAssign } from './lib/deep-assign';
import { generateCSSFromImageItem, getImageItem, invertImageItem } from './lib/images';
import { inlineCSS } from './lib/inline-css';
import { isFramed } from './lib/is-framed';
import { generateCssFromStyles, getStyles, invertStyles, StylesCollection, StyleSheetCSSArray } from './lib/styles';
import { transformLayerCSS } from './lib/transform-layer-css';

let currentStylesheets: StyleSheetCSSArray = [];

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
  currentStylesheets = stylesheets;

  // Update stylesheets
  updateStylesheets(stylesheets);

  // Invert images
  const imageElements = document.querySelectorAll('img, picture source');
  for (const imageElement of imageElements) {
    getImageItem(imageElement).then((imageItem) => {
      if (typeof imageItem !== 'boolean') {
        invertImageItem(imageItem).then((invertImageItem) => {
          if (typeof imageItem !== 'boolean') {
            // Generate css
            const invertImageItemCSS = generateCSSFromImageItem(invertImageItem);

            // Update stylesheet
            currentStylesheets.push(invertImageItemCSS);
            updateStylesheets(currentStylesheets);
          }
        });
      }
    });
  }

  if (!isFramed()) {
    // Prepare button
    initializeButton();

    // Prepare control panel
    initializePanel();
  }
}
