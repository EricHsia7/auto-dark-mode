import { initializeButton } from './interface/button/index';
import { initializePanel, updateStylesheets } from './interface/panel/index';
import { findStyleSheetByNode } from './lib/find-stylesheet-by-node';
import { generateCssFromImageItem, getImageItem, invertImageItem } from './lib/images';
import { inlineCSS } from './lib/inline-css';
import { isFramed } from './lib/is-framed';
import { cssVariableReferenceMap, currentStylesCollection, generateCssFromStyles, invertStyles, StylesCollection, StyleSheetCSSArray, updateStyles } from './lib/styles';
import { isSVGElement, svgElementsQuerySelectorString } from './lib/svg-elements';
import { transformLayerCSS } from './lib/transform-layer-css';

let currentStylesheets: StyleSheetCSSArray = [];
let imageStylesheets: StyleSheetCSSArray = [];

const processingElements = new Set();

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
  currentStylesheets = generateCssFromStyles(invertedStyles, false);

  // Update stylesheets
  updateStylesheets(currentStylesheets.concat(imageStylesheets));

  const stylesheetsObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (processingElements.has(node)) {
            continue;
          }
          if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
            inlineCSS([node]);
          } else if (node instanceof HTMLStyleElement) {
            processingElements.add(node);
            const cssText = node.textContent;
            if (cssText && cssText.length > 0) {
              const transformedCSS = transformLayerCSS(cssText);
              node.textContent = transformedCSS;
            }
            const sheet = findStyleSheetByNode(node);
            if (sheet) {
              // Update styles
              updateStyles([], [], [sheet]);

              // Invert styles
              const invertedStyles = invertStyles(currentStylesCollection, cssVariableReferenceMap) as StylesCollection;

              // Generate css
              currentStylesheets = generateCssFromStyles(invertedStyles, false);

              // Update stylesheets
              updateStylesheets(currentStylesheets.concat(imageStylesheets));
            }
            processingElements.delete(node);
          }
        }
      }
    }
  });

  stylesheetsObserver.observe(document.head, {
    childList: true,
    subtree: true
  });

  const elementsObserver = new MutationObserver((mutations) => {
    const elementsWithInlineStyleToUpdate = [];
    const svgElementsToUpdate = [];

    for (const mutation of mutations) {
      if (mutation.type === 'childList' /* || mutation.type === 'attributes' */) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          // Traverse the subtree of added nodes
          const allElements = Array.from(node.querySelectorAll('*')).concat(node);
          for (const element of allElements) {
            if (element.hasAttribute('style')) {
              elementsWithInlineStyleToUpdate.push(element);
            }
            if (isSVGElement(element?.nodeName || element?.tagName || '')) {
              svgElementsToUpdate.push(element);
            }
          }
        }
      }
    }

    // Update styles
    updateStyles(elementsWithInlineStyleToUpdate, svgElementsToUpdate, []);

    // Invert styles
    const invertedStyles = invertStyles(currentStylesCollection, cssVariableReferenceMap) as StylesCollection;

    // Generate inverted css
    currentStylesheets = generateCssFromStyles(invertedStyles, false);

    // Update stylesheets
    updateStylesheets(currentStylesheets.concat(imageStylesheets));
  });

  elementsObserver.observe(document.body, {
    subtree: true,
    // attributes: true,
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
            imageStylesheets.push(invertImageItemCSS);

            updateStylesheets(currentStylesheets.concat(imageStylesheets));
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
              imageStylesheets.push(invertImageItemCSS);

              updateStylesheets(currentStylesheets.concat(imageStylesheets));
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
