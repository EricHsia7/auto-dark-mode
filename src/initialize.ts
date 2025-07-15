import { initializeButton } from './interface/button/index';
import { initializePanel, updateStylesheets } from './interface/panel/index';
import { generateCssFromImageItem, getImageItem, invertImageItem } from './lib/images';
import { inlineCSS } from './lib/inline-css';
import { isFramed } from './lib/is-framed';
import { cssVariableReferenceMap, currentStylesCollection, generateCssFromStyles, invertStyles, StylesCollection, StyleSheetCSSArray, updateStyles } from './lib/styles';
import { svgElementsQuerySelectorString } from './lib/svg-elements';
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
    if (cssText && cssText.length > 0) {
      const transformedCSS = transformLayerCSS(cssText);
      styleTag.textContent = transformedCSS;
    }
    // TODO: prevent overwriting rules dynamically inserted by JavaScript
  }

  // Inline external/foreign CSS
  const linkElements = document.querySelectorAll('link[rel="stylesheet"][href]') as NodeListOf<HTMLLinkElement>;
  await inlineCSS(linkElements);

  // Update styles
  const elementsWithInlineStyle = document.querySelectorAll('[style]') as NodeListOf<HTMLElement>;
  const svgElements = document.querySelectorAll(svgElementsQuerySelectorString) as NodeListOf<HTMLElement>;
  updateStyles(elementsWithInlineStyle, svgElements, document.styleSheets);

  // Invert styles
  const invertedStyles = invertStyles(currentStylesCollection, cssVariableReferenceMap) as StylesCollection;

  // Generate inverted css
  const stylesheets = generateCssFromStyles(invertedStyles, false);
  currentStylesheets = stylesheets;

  // Update stylesheets
  updateStylesheets(stylesheets);

  const stylesheetsObserver = new MutationObserver((mutations) => {
    const stylesheetsToUpdate = new Map();

    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        if (mutation.target instanceof HTMLLinkElement) {
          if (mutation.target.rel === 'stylesheet') {
            stylesheetsToUpdate.set(mutation.target, false);
          }
        }
        if (mutation.target instanceof HTMLStyleElement) {
          stylesheetsToUpdate.set(mutation.target, false);
        }
      }
    }

    const documentStyleSheets = new Map();
    for (const stylesheet of document.styleSheets) {
      documentStyleSheets.set(stylesheet.ownerNode, stylesheet);
    }

    for (const key of stylesheetsToUpdate.keys()) {
      if (documentStyleSheets.has(key)) {
        stylesheetsToUpdate.set(key, documentStyleSheets.get(key));
      }
    }

    // Update styles
    updateStyles([], [], stylesheetsToUpdate.values().filter());

    // Invert styles
    const invertedStyles = invertStyles(currentStylesCollection, cssVariableReferenceMap) as StylesCollection;

    // Generate inverted css
    const stylesheets = generateCssFromStyles(invertedStyles, false);
    currentStylesheets = stylesheets;

    // Update stylesheets
    updateStylesheets(stylesheets);
  });

  stylesheetsObserver.observe(document.documentElement, {
    subtree: false,
    childList: true
  });

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

  const imageObserver = new MutationObserver((mutations) => {
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

  imageObserver.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset'],
    childList: true
  });
}
