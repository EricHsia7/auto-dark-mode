import { evaluateTheme } from './evaluate-theme';
import { generateIdentifier } from './generate-identifier';
import { isInvertible } from './is-invertible';
import { isPreserved } from './is-preserved';
import { invertParsedColor, parseColor, ParsedColorRGBA, parsedColorToString } from './parse-color';

export type CSSProperties = {
  [property: string]: string;
};

export type StyleSheet = {
  [selector: string]: CSSProperties;
};

export type StylesCollection = {
  [sheetName: string]: StyleSheet;
};

export type CSSVariableReferenceMap = {
  [cssVariableKey: string]: [backgroundColorCount: number, textColorCount: number];
};

export interface Styles {
  stylesCollection: StylesCollection;
  referenceMap: CSSVariableReferenceMap;
}

export interface StyleSheetCSSItem {
  css: string;
  name: string;
}

export type StyleSheetCSSArray = Array<StyleSheetCSSItem>;

export function getStyles(): Styles {
  const cssVariableReferenceMap: CSSVariableReferenceMap = {};
  const stylesCollection: StylesCollection = {
    '@stylesheet-default': {
      'html, body': {
        'background-color': '#f9fafc',
        'color': '#111111'
      },
      'h1, h2, h3, h4, h5, h6, p, span, time': {
        color: '#111111'
      },
      'a': {
        color: '#1472ff'
      },
      'a:hover': {
        color: '#187dff'
      },
      'input[type="text"], input[type="email"], input[type="password"], input[type="number"], textarea, select, button, input[type="submit"], input[type="button"]': {
        'border-color': '#111111',
        'border-style': 'solid',
        'border-width': '1px',
        'background-color': 'rgba(0, 0, 0, 0)',
        'color': '#111111'
      },
      'input[type="text"]::placeholder, input[type="email"]::placeholder, input[type="password"]::placeholder, textarea::placeholder': {
        color: '#888888'
      },
      'table': {
        'background-color': 'rgba(0, 0, 0, 0)'
      },
      'th, td': {
        'border-color': '#e5e7eb',
        'border-style': 'solid',
        'border-width': '1px'
      },
      'th': {
        'background-color': 'rgba(0, 0, 0, 0)',
        'color': '#111111'
      },
      'tr': {
        'border-bottom-color': '#e5e7eb',
        'border-bottom-style': 'solid',
        'border-bottom-width': '1px'
      },
      'thead': {
        'background-color': 'rgba(0, 0, 0, 0)',
        'border-bottom-color': '#e5e7eb',
        'border-bottom-style': 'solid',
        'border-bottom-width': '2px'
      },
      'tbody': {
        'background-color': 'rgba(0, 0, 0, 0)'
      },
      'tfoot': {
        'background-color': 'rgba(0, 0, 0, 0)',
        'border-top-color': '#e5e7eb',
        'border-top-style': 'solid',
        'border-top-width': '2px'
      },
      'colgroup': {
        border: 'none'
      },
      'col': {
        'background-color': 'rgba(0, 0, 0, 0)'
      },
      'blockquote': {
        'border-left-color': '#e5e7eb',
        'border-left-style': 'solid',
        'border-left-width': '4px',
        'padding-left': '20px',
        'color': '#6b7280'
      },
      'pre': {
        'background-color': '#f9fafc',
        'border-color': '#e5e7eb',
        'border-style': 'solid',
        'border-width': '1px',
        'color': '#111111'
      },
      'code': {
        'background-color': '#f9fafc',
        'color': '#111111'
      },
      'hr': {
        'border': 'none',
        'background-color': '#e5e7eb'
      },
      'figcaption, caption': {
        color: '#808080'
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
        'background-color': 'rgba(0, 0, 0, 0)'
      },
      'summary': {
        color: '#111111'
      },
      'small': {
        color: '#111111'
      },
      'strong': {
        color: '#111111'
      },
      'em': {
        color: '#111111'
      },
      'ul, ol': {
        color: '#111111'
      },
      'li': {
        color: '#111111'
      },
      'mark': {
        'background-color': '#fffd75',
        'color': '#111111'
      }
    },
    '@stylesheet-image-dimming': {
      img: {
        'filter': 'brightness(70%)',
        '-webkit-filter': 'brightness(70%)'
      }
    }
  };

  if ('styleSheets' in document) {
    function processRules(rules: CSSRuleList, container: { [key: string]: any }) {
      for (const rule of rules) {
        switch (rule.type) {
          case CSSRule.STYLE_RULE: {
            const styleRule = rule as CSSStyleRule;
            const selectorText = styleRule.selectorText;
            if (!container.hasOwnProperty(selectorText)) {
              container[selectorText] = {};
            }
            const extendedRuleStyle = Array.from(styleRule.style).concat(['background' /*, 'border' */]);
            for (const prop of extendedRuleStyle) {
              const value = styleRule.style.getPropertyValue(prop).trim();
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
            const mediaRule = rule as CSSMediaRule;
            const media = `@media ${mediaRule.conditionText}`;
            if (!container.hasOwnProperty(media)) {
              container[media] = {};
            }
            processRules(mediaRule.cssRules, container[media]);
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
            const importRule = rule as CSSImportRule;
            if (importRule.styleSheet) {
              // Import rules with nested stylesheets
              try {
                processRules(importRule.styleSheet.cssRules, container);
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
        const name = sheet.ownerNode?.nodeName.toString().toLowerCase();
        const sheetName = `@stylesheet-${name}-${index}-${identifier}`;
        stylesCollection[sheetName] = sheetObj;
        index++;
      } catch (e) {
        // Skipped due to access restrictions
      }
    }
  }

  // Capture all inline stylesCollection (lambda stylesCollection)
  function generateElementSelector(element: HTMLElement): string {
    const tag = element.tagName.toLowerCase();
    if (!element.id) {
      element.id = `_${generateIdentifier()}`;
    }
    const id = element.id ? `#${element.id}` : '';
    const classes = element.classList.length > 0 ? `.${Array.from(element.classList).join('.')}` : '';
    return `${tag}${id}${classes}`;
  }

  const lambdaStyles: StyleSheet = {};
  const elementsWithInlineStyle = document.querySelectorAll('[style]') as NodeListOf<HTMLElement>;
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

  stylesCollection['@stylesheet-lambda'] = lambdaStyles;

  const results = {
    stylesCollection: stylesCollection,
    referenceMap: cssVariableReferenceMap
  };

  return results;
}

export function invertStyles(object: StylesCollection | StyleSheet | CSSProperties, referenceMap: CSSVariableReferenceMap, path: string[] = []): CSSProperties | StyleSheet | StylesCollection {
  const newStyles: any = {};
  let backgroundColorRed = 0;
  let backgroundColorGreen = 0;
  let backgroundColorBlue = 0;
  let backgroundColorQuantity = 0;

  let textColorRed = 0;
  let textColorGreen = 0;
  let textColorBlue = 0;
  let textColorQuantity = 0;

  for (const key in object) {
    const value = object[key];
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
      } else if (isPreserved(key)) {
        newStyles[key] = value;
      }
    }
  }

  const mainBackgroundColor: ParsedColorRGBA = {
    type: 'rgba',
    rgba: backgroundColorQuantity > 0 ? [(backgroundColorRed / backgroundColorQuantity) * 255, (backgroundColorGreen / backgroundColorQuantity) * 255, (backgroundColorBlue / backgroundColorQuantity) * 255, 1] : [0, 0, 0, 0]
  };
  const mainTextColor: ParsedColorRGBA = {
    type: 'rgba',
    rgba: textColorQuantity > 0 ? [(textColorRed / textColorQuantity) * 255, (textColorGreen / textColorQuantity) * 255, (textColorBlue / textColorQuantity) * 255, 1] : [0, 0, 0, 0]
  };
  const originalTheme = evaluateTheme(mainBackgroundColor, mainTextColor);
  if (originalTheme === 'light') {
    return newStyles;
  } else {
    return object;
  }
}

export function generateCssFromStyles(object: StylesCollection | StyleSheet, nested: boolean = false): StyleSheetCSSArray {
  const results: StyleSheetCSSArray = [];

  for (const sheet in object) {
    const header = nested ? '' : `/* ${sheet} */`;
    let result = '';
    let basicRules = '';

    for (const selector in object[sheet]) {
      const properties = object[sheet][selector];

      if (typeof properties === 'object' && properties !== null && !Array.isArray(properties)) {
        const isNestedBlock = selector.startsWith('@') || Object.values(properties).some((v) => typeof v === 'object');

        if (isNestedBlock) {
          const nestedContent = generateCssFromStyles({ nested: properties }, true)
            .map((obj) => obj.css)
            .join('');
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

    results.push({
      name: sheet,
      css: `${header}${result}`
    });
  }

  return results;
}
