import { getDefaultValue } from './default-colors';
import { generateIdentifier } from './generate-identifier';
import { isColorRelatedProperty } from './is-color-related-property';
import { invertParsedColor, parseColor, parsedColorToString } from './parse-color';

export function getStyles() {
  const result = {};
  if ('styleSheets' in document) {
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
              const value = rule.style.getPropertyValue(prop).trim();
              if (value.length > 0) {
                container[thisSelectorText][prop] = value;
              } else {
                const defaultValue = getDefaultValue(prop);
                if (defaultValue) {
                  container[thisSelectorText][prop] = defaultValue;
                }
              }
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
                const value = kf.style.getPropertyValue(prop).trim();
                if (value.length > 0) {
                  container[name][kf.keyText][prop] = value;
                }
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
                // console.warn('Cannot access imported stylesheet:', e);
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
        const identifier = '__'.concat(sheet.ownerNode?.id || sheet.ownerNode?.getAttribute?.('href') || `inline${generateIdentifier()}`);
        result[identifier] = sheetObj;
      } catch (e) {
        // Security/CORS error – skip this stylesheet
        // console.warn('Skipping inaccessible stylesheet:', e);
      }
    }
  }
  // TODO: capture style attribute (lambda styles)
  return result;
}

export function invertStyles(styles: any, path: string[] = []): any {
  const newStyles: any = {};

  for (const key in styles) {
    const value = styles[key];
    const currentPath = [...path, key];

    if (typeof value === 'object' && value !== null) {
      newStyles[key] = invertStyles(value, currentPath); // Recursive copy
    } else {
      // Leaf node: reached a CSS property/value pair
      if (isColorRelatedProperty(key, value)) {
        const parsedColor = parseColor(value);
        if (parsedColor) {
          const invertedColor = invertParsedColor(parsedColor);
          newStyles[key] = parsedColorToString(invertedColor);
        } else {
          newStyles[key] = value; // If parsing fails, keep original
        }
      } else {
        newStyles[key] = value;
      }
    }
  }

  return newStyles;
}

export function flattenStyles(styles: Record<string, any>): any {
  const merged: Record<string, any> = {};
  for (const sheetName in styles) {
    for (const key in styles[sheetName]) {
      if (!merged.hasOwnProperty(key)) {
        merged[key] = {};
      }
      merged[key] = Object.assign(merged[key], styles[sheetName][key]);
    }
  }
  return merged;
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
