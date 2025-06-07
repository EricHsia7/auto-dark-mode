import { evaluateTheme } from './evaluate-theme';
import { generateIdentifier } from './generate-identifier';
import { isInvertible } from './is-invertible';
import { invertParsedColor, parseColor, parsedColorToString } from './parse-color';

export function getStyles() {
  const cssVariableReferenceMap: {
    [cssVariableKey: string]: [backgroundColorCount: number, textColorCount: number];
  } = {};
  const styles = {
    '@stylesheet-default': {
      'html, body': {
        'background-color': '#f9fafc',
        'color': '#08090a'
      },
      'h1, h2, h3, h4, h5, h6, p, span': {
        color: '#08090a'
      },
      'a': {
        color: '#1472ff'
      },
      'a:hover': {
        color: '#187dff'
      },
      'input[type="text"], input[type="email"], input[type="password"], input[type="number"], textarea, select, button, input[type="submit"], input[type="button"]': {
        'border-color': '#e5e7eb',
        'border-style': 'solid',
        'border-width': '1px',
        'background-color': '#f9fafc',
        'color': '#08090a'
      },
      'input[type="text"]::placeholder, input[type="email"]::placeholder, input[type="password"]::placeholder, textarea::placeholder': {
        color: '#888888'
      },
      'input[type="text"]:focus, input[type="email"]:focus, input[type="password"]:focus, input[type="number"]:focus, textarea:focus, select:focus': {
        'border-color': '#1472ff',
        'border-style': 'solid',
        'border-width': '1px'
      },
      'button:disabled, input:disabled, textarea:disabled, select:disabled': {
        'background-color': '#f3f4f6',
        'color': '#6b7280',
        'border-color': '#e5e7eb',
        'opacity': '0.7'
      },
      'table': {
        'background-color': '#f3f4f6'
      },
      'th, td': {
        'border-color': '#e5e7eb',
        'border-style': 'solid',
        'border-width': '1px'
      },
      'th': {
        'background-color': '#f3f4f6',
        'color': '#08090a'
      },
      'tr': {
        'border-bottom-color': '#e5e7eb',
        'border-bottom-style': 'solid',
        'border-bottom-width': '1px'
      },
      'thead': {
        'background-color': '#f3f4f6',
        'border-bottom-color': '#e5e7eb',
        'border-bottom-style': 'solid',
        'border-bottom-width': '2px'
      },
      'tbody': {
        'background-color': '#f3f4f6'
      },
      'tfoot': {
        'background-color': '#f3f4f6',
        'border-top-color': '#e5e7eb',
        'border-top-style': 'solid',
        'border-top-width': '2px'
      },
      'colgroup': {
        border: 'none'
      },
      'col': {
        'background-color': '#f3f4f6'
      },
      'blockquote': {
        'border-left-color': '#e5e7eb',
        'border-left-style': 'solid',
        'border-left-width': '4px',
        'padding-left': '20px',
        'color': '#6b7280'
      },
      'pre': {
        'background-color': '#f3f4f6',
        'border-color': '#e5e7eb',
        'border-style': 'solid',
        'border-width': '1px',
        'color': '#08090a'
      },
      'code': {
        'background-color': '#f3f4f6',
        'color': '#08090a'
      },
      'hr': {
        'border': 'none',
        'background-color': '#e5e7eb'
      },
      'figcaption, caption': {
        color: '#6b7280'
      },
      'progress': {
        'background-color': '#e5e7eb'
      },
      'progress::-webkit-progress-bar': {
        'background-color': '#e5e7eb'
      },
      'progress::-webkit-progress-value': {
        'background-color': '#1472ff'
      },
      'progress::-moz-progress-bar': {
        'background-color': '#1472ff'
      },
      'details': {
        'border-color': '#e5e7eb',
        'border-style': 'solid',
        'border-width': '1px',
        'background-color': '#f3f4f6'
      },
      'summary': {
        color: '#08090a'
      },
      'small': {
        color: '#08090a'
      },
      'strong': {
        color: '#08090a'
      },
      'em': {
        color: '#08090a'
      },
      'ul, ol': {
        color: '#08090a'
      },
      'li': {
        color: '#08090a'
      },
      'mark': {
        'background-color': '#fffd75',
        'color': '#08090a'
      }
    }
  };

  if ('styleSheets' in document) {
    function processRules(rules, container) {
      for (const rule of rules) {
        switch (rule.type) {
          case CSSRule.STYLE_RULE: {
            const selectorText = rule.selectorText;
            if (!container.hasOwnProperty(selectorText)) {
              container[selectorText] = {};
            }
            const extendedRuleStyle = Array.from(rule.style).concat(['background' /*, 'border' */]);
            for (const prop of extendedRuleStyle) {
              const value = rule.style.getPropertyValue(prop).trim();
              if (value.length > 0) {
                container[selectorText][prop] = value;
                // Check if value refers to a CSS variable
                const cssVarMatch = value.match(/^var\((\s*--[^\)]+)\)/);
                if (cssVarMatch !== null) {
                  const cssVariableKey = cssVarMatch[1];
                  if (!cssVariableReferenceMap.hasOwnProperty(cssVariableKey)) {
                    cssVariableReferenceMap[cssVariableKey] = [0, 0];
                  }
                  if (prop === 'background' || prop === 'background-color') {
                    cssVariableReferenceMap[cssVariableKey][0] += 1;
                  }
                  if (prop === 'color') {
                    cssVariableReferenceMap[cssVariableKey][1] += 1;
                  }
                }
              }
            }
            break;
          }

          case CSSRule.MEDIA_RULE: {
            const media = `@media ${rule.conditionText}`;
            if (!container.hasOwnProperty(media)) {
              container[media] = {};
            }
            processRules(rule.cssRules, container[media]);
            break;
          }
          /*
          case CSSRule.KEYFRAMES_RULE: {
            // Keyframes
            const name = `@keyframes ${rule.name}`;
            if (!container.hasOwnProperty(name)) {
              container[name] = {};
            }
            for (const keyframe of rule.cssRules) {
              const keyText = keyframe.keyText;
              if (!container[name].hasOwnProperty(keyText)) {
                container[name][keyText] = {};
              }
              for (const prop of keyframe.style) {
                const value = keyframe.style.getPropertyValue(prop).trim();
                if (value.length > 0) {
                  container[name][keyText][prop] = value;
                }
              }
            }
            break;
          }
          */
          case CSSRule.IMPORT_RULE: {
            if (rule.styleSheet) {
              // Import rules with nested stylesheets
              try {
                processRules(rule.styleSheet.cssRules, container);
              } catch (e) {
                // Skipped due to CORS/security
              }
            }
            break;
          }
          default: {
            // container[`@unknown-${rule.type}`] = rule.cssText;
            break;
          }
        }
      }
    }

    let index = 0;
    for (const sheet of document.styleSheets) {
      try {
        if (!sheet.cssRules) continue;
        const sheetObj = {};
        processRules(sheet.cssRules, sheetObj);
        const identifier = sheet.ownerNode?.id || generateIdentifier();
        const name = sheet.ownerNode?.nodeName;
        const sheetName = `@stylesheet-${name}-${index}-${identifier}`;
        styles[sheetName] = sheetObj;
        index++;
      } catch (e) {
        // Skipped due to access restrictions
      }
    }
  }

  // Capture all inline styles (lambda styles)
  function generateElementSelector(element: HTMLElement): string {
    const tag = element.tagName.toLowerCase();
    if (!element.id) {
      element.id = `_${generateIdentifier()}`;
    }
    const id = element.id ? `#${element.id}` : '';
    const classes = element.classList.length > 0 ? `.${Array.from(element.classList).join('.')}` : '';
    return `${tag}${id}${classes}`;
  }

  const lambdaStyles = {};
  const elementsWithInlineStyle = document.querySelectorAll('[style]');
  for (const element of elementsWithInlineStyle) {
    if (element.style.length > 0) {
      const selector = generateElementSelector(element);

      if (!lambdaStyles.hasOwnProperty(selector)) {
        lambdaStyles[selector] = {};
      }

      for (const prop of element.style) {
        const value = element.style.getPropertyValue(prop).trim();
        if (value.length > 0) {
          lambdaStyles[selector][prop] = value;
        }
      }
    }
  }

  styles['@stylesheet-lambda'] = lambdaStyles;

  const results = {
    styles: styles,
    referenceMap: cssVariableReferenceMap
  };

  console.log(results);

  return results;
}

export function invertStyles(styles: any, referenceMap: any, path: string[] = []): any {
  const newStyles: any = {};

  let backgroundColorRed = 0;
  let backgroundColorGreen = 0;
  let backgroundColorBlue = 0;
  let backgroundColorQuantity = 0;

  let textColorRed = 0;
  let textColorGreen = 0;
  let textColorBlue = 0;
  let textColorQuantity = 0;

  for (const key in styles) {
    const value = styles[key];
    const currentPath = path.concat(key);

    if (typeof value === 'object' && value !== null) {
      newStyles[key] = invertStyles(value, referenceMap, currentPath); // Recursive copy
    } else {
      // Leaf node: reached a CSS property/value pair
      if (isInvertible(key, value)) {
        const parsedColor = parseColor(value);
        if (parsedColor) {
          const invertedColor = invertParsedColor(parsedColor);
          newStyles[key] = parsedColorToString(invertedColor);
          if (parsedColor.type === 'rgba') {
            if (key === 'background-color' || key === 'background') {
              backgroundColorRed += parsedColor.rgba[0] / 255;
              backgroundColorGreen += parsedColor.rgba[1] / 255;
              backgroundColorBlue += parsedColor.rgba[2] / 255;
              backgroundColorQuantity += 1;
            }
            if (key === 'color') {
              textColorRed += parsedColor.rgba[0] / 255;
              textColorGreen += parsedColor.rgba[1] / 255;
              textColorBlue += parsedColor.rgba[2] / 255;
              textColorQuantity += 1;
            }
            if (key.startsWith('--')) {
              if (referenceMap.hasOwnProperty(key)) {
                if (referenceMap[key][0] > referenceMap[key][1]) {
                  backgroundColorRed += parsedColor.rgba[0] / 255;
                  backgroundColorGreen += parsedColor.rgba[1] / 255;
                  backgroundColorBlue += parsedColor.rgba[2] / 255;
                  backgroundColorQuantity += 1;
                }
                if (referenceMap[key][0] < referenceMap[key][1]) {
                  textColorRed += parsedColor.rgba[0] / 255;
                  textColorGreen += parsedColor.rgba[1] / 255;
                  textColorBlue += parsedColor.rgba[2] / 255;
                  textColorQuantity += 1;
                }
              }
            }
          }
        } else {
          newStyles[key] = value; // If parsing fails, keep original
        }
      }
    }
  }

  const mainBackgroundColor = {
    type: 'rgba',
    rgba: backgroundColorQuantity > 0 ? [(backgroundColorRed / backgroundColorQuantity) * 255, (backgroundColorGreen / backgroundColorQuantity) * 255, (backgroundColorBlue / backgroundColorQuantity) * 255, 1] : [0, 0, 0, 0]
  };
  const mainTextColor = {
    type: 'rgba',
    rgba: textColorQuantity > 0 ? [(textColorRed / textColorQuantity) * 255, (textColorGreen / textColorQuantity) * 255, (textColorBlue / textColorQuantity) * 255, 1] : [0, 0, 0, 0]
  };
  const originalTheme = evaluateTheme(mainBackgroundColor, mainTextColor);
  if (originalTheme === 'light') {
    return newStyles;
  } else {
    return styles;
  }
}

export function stylesToStrings(styles: any, nested: boolean = false): Array<string> {
  const results: string[] = [];

  for (const sheet in styles) {
    const header = nested ? '' : `/* ${sheet} */`;
    let result = '';
    let basicRules = '';

    for (const selector in styles[sheet]) {
      const properties = styles[sheet][selector];

      if (typeof properties === 'object' && properties !== null && !Array.isArray(properties)) {
        const isNestedBlock = selector.startsWith('@') || Object.values(properties).some((v) => typeof v === 'object');

        if (isNestedBlock) {
          const nestedContent = stylesToStrings({ nested: properties }, true).join('');
          result += `${selector}{${nestedContent}}`;
        } else {
          let rule = `${selector}{`;
          for (const prop in properties) {
            const val = properties[prop];
            rule += `${prop}:${val}${sheet === '@stylesheet-lambda' ? '!important' : ''};`;
          }
          rule += '}';
          basicRules += rule;
        }
      }
    }

    if (basicRules.trim()) {
      if (nested) {
        result = `${basicRules}${result}`;
      } else {
        result = `@media (prefers-color-scheme:dark){${basicRules}}${result}`;
      }
    }

    results.push(`${header}${result}`);
  }

  return results;
}
