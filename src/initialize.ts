import { initializeButton } from './interface/button/index';
import { initializePanel, updateStylesheets } from './interface/panel/index';
import { deepAssign } from './lib/deep-assign';
import { inlineCSS } from './lib/inline-css';
import { isFramed } from './lib/is-framed';
import { generateCssFromStyles, getStyles, invertStyles, Styles, StylesCollection } from './lib/styles';
import { transformLayerCSS } from './lib/transform-layer-css';

let currentStyles = {} as Styles;
let isProcessing = false;
const targetNode = document.body;
const config = {
  childList: true,
  subtree: true,
  characterData: true
};
const mutationsListQueue = [];

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

  // if (!isFramed()) {
  // Prepare button
  initializeButton();

  // Prepare control panel
  initializePanel();
  // }

  // Update stylesheets
  updateStylesheets(stylesheets);

  // Listen to changes
  const observer = new MutationObserver(handleMutation);

  // Initial observation
  observer.observe(targetNode, config);
}

function handleMutation(mutationsList, obs) {
  if (mutationsList.length > 0) {
    mutationsListQueue.push(mutationsList);
  }

  if (isProcessing) return;

  const currentMutationsList = mutationsListQueue.shift();

  let needUpdate = false;
  for (const mutation of currentMutationsList) {
    if (mutation.type === 'childList') {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) needUpdate = true;
        if (node instanceof HTMLLinkElement) needUpdate = true;
        if (node instanceof HTMLStyleElement && node.tagName.toLowerCase() === 'style') needUpdate = true;
      }
    } else if (mutation.type === 'attributes') {
      if (mutation.attributeName === 'style') {
        // needUpdate = true;
      }
    }
  }

  if (!needUpdate) return;

  // Pause observing to avoid reacting to mutations caused by the processing
  obs.disconnect();
  isProcessing = true;

  // Process the mutations
  update(mutationsList, obs).then(function () {
    isProcessing = false;
    // Resume observing
    obs.observe(targetNode, config);
    if (mutationsListQueue.length > 0) {
      handleMutation([], obs);
    }
  });
}

async function update() {
  await inlineCSS();
  const styles = getStyles();
  const patchedStylesCollection = deepAssign(currentStyles.stylesCollection, styles.stylesCollection);
  const patchedReferenceMap = deepAssign(currentStyles.referenceMap, styles.referenceMap);
  currentStyles = { stylesCollection: patchedStylesCollection, referenceMap: patchedReferenceMap };
  const invertedStyles = invertStyles(patchedStylesCollection, patchedReferenceMap) as StylesCollection;
  const stylesheets = generateCssFromStyles(invertedStyles, false);
  updateStylesheets(stylesheets);
}
