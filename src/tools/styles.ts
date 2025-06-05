import { generateIdentifier } from './index';

export function getStyles() {
  if ('styleSheets' in document) {
    const result = {};
    function processRules(rules, container) {
      for (const rule of rules) {
        switch (rule.type) {
          case CSSRule.STYLE_RULE: {
            // Basic style rule
            const thisSelectorText = rule.selectorText;
            if (!container.hasOwnProperty(thisSelectorText)) {
              container[thisSelectorText] = {};
            }
            for (const prop of rule.style) {
              container[thisSelectorText][prop] = rule.style.getPropertyValue(prop).trim();
            }
            break;
          }
          case CSSRule.MEDIA_RULE: {
            // Media queries
            const media = `@media ${rule.conditionText}`;
            if (!container.hasOwnProperty(media)) {
              container[media] = {};
            }
            processRules(rule.cssRules, container[media]);
            break;
          }
          case CSSRule.KEYFRAMES_RULE: {
            // Keyframes
            const name = `@keyframes ${rule.name}`;
            if (!container.hasOwnProperty(name)) {
              container[name] = {};
            }
            for (const kf of rule.cssRules) {
              container[name][kf.keyText] = {};
              for (const prop of kf.style) {
                container[name][kf.keyText][prop] = kf.style.getPropertyValue(prop).trim();
              }
            }
            break;
          }
          case CSSRule.IMPORT_RULE: {
            if (rule.styleSheet) {
              // Import rules with nested stylesheets
              try {
                processRules(rule.styleSheet.cssRules, container);
              } catch (e) {
                console.warn('Cannot access imported stylesheet:', e);
              }
            }
            break;
          }
          default: {
            // Other types can be added here if needed
            container[`@unknown_${rule.type}`] = rule.cssText;
            break;
          }
        }
      }
    }

    for (const sheet of document.styleSheets) {
      try {
        if (!sheet.cssRules) continue; // No access
        const sheetObj = {};
        processRules(sheet.cssRules, sheetObj);
        const title = sheet.ownerNode?.id || sheet.ownerNode?.getAttribute?.('href') || `inline${generateIdentifier()}`;
        result[title] = sheetObj;
      } catch (e) {
        // Security/CORS error – skip this stylesheet
        console.warn('Skipping inaccessible stylesheet:', e);
      }
    }

    return result;
  }
}
