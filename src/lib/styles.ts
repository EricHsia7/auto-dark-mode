import { generateIdentifier } from './generate-identifier';
import { invertColor, invertRGBA } from './invert-color';
import { isColorRelatedProperty } from './is-color-related-property';
import { parseColor, parsedColorToString } from './parse-color';

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

export function invertStyles(styles: any, path: string[] = []) {
  for (const key in styles) {
    const value = styles[key];
    const currentPath = [...path, key];

    if (typeof value === 'object' && value !== null) {
      invertStyles(value, currentPath); // Recurse into nested objects
    } else {
      // Leaf node: reached a CSS property/value pair
      if (isColorRelatedProperty(key)) {
        const parsedColor = parseColor(value);
        if (parsedColor) {
          const invertedColor = invertColor(parsedColor);
          styles[key] = parsedColorToString(invertedColor);
        }
      }
    }
  }
}

export function stylesToString(styles: any, indent = ''): string {
  let result = '';
  let basicRules = '';

  for (const selector in styles) {
    const properties = styles[selector];
    if (typeof properties === 'object' && properties !== null && !Array.isArray(properties)) {
      // Check if this is a nested block (e.g., @media, @keyframes, or keyframe steps)
      const isNestedBlock = selector.startsWith('@') || Object.values(properties).some((v) => typeof v === 'object');
      if (isNestedBlock) {
        result += `${indent}${selector} {\n`;
        result += stylesToString(properties, indent + '  ');
        result += `${indent}}\n`;
      } else {
        // Collect basic rules to wrap later
        basicRules += `${indent}${selector} {\n`;
        for (const prop in properties) {
          basicRules += `${indent}  ${prop}: ${properties[prop]};\n`;
        }
        basicRules += `${indent}}\n`;
      }
    }
  }

  // If there are basic rules, wrap them in the dark mode media query
  if (basicRules) {
    result =
      `${indent}@media (prefers-color-scheme: dark) {\n` +
      basicRules.replace(/^/gm, indent + '  ') + // indent all lines
      `${indent}}\n` +
      result;
  }

  return result;
}
