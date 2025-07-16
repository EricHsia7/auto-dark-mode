import { ColorRGBA, colorToString, invertColor, parseColor } from './color';
import { deepAssign } from './deep-assign';
import { evaluateTheme } from './evaluate-theme';
import { generateElementSelector } from './generate-element-selector';
import { generateIdentifier } from './generate-identifier';
import { getInheritedPresentationAttribute } from './get-inherited-presentation-attribute';
import { isInvertible } from './is-invertible';
import { isPreserved } from './is-preserved';
import { joinByDelimiters } from './join-by-delimiters';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';
import { SVGPresentationAttributesList } from './svg-presentation-attributes';

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

export let cssVariableReferenceMap: CSSVariableReferenceMap = {};
export let currentStylesCollection: StylesCollection = {
  '@stylesheet-default': {
    'html, body': {
      'background-color': '#ffffff',
      'color': '#000000'
    },
    'section, header, main, footer, article': {
      color: '#000000'
    },
    'h1, h2, h3, h4, h5, h6, span, time, a, a:hover': {
      'background-color': 'rgba(0, 0, 0, 0)',
      'color': '#000000'
    },
    'pre, code, p, div': {
      'background-color': 'rgba(0, 0, 0, 0)',
      'color': '#000000'
    },
    'math, mi, mn, mo, mtext, ms, mspace, mglyph, mrow, mfenced, mfrac, msqrt, mroot, mstyle, merror, mpadded, mphantom, menclose, semantics, msub, msup, msubsup, munder, mover, munderover, mmultiscripts, mprescripts, mtable, mtr, mtd, mlabeledtr': {
      'background-color': 'rgba(0, 0, 0, 0)',
      'color': '#000000'
    },
    'input[type="text"], input[type="email"], input[type="password"], input[type="number"], textarea, select, button, input[type="submit"], input[type="button"], input:not([type])': {
      'background-color': 'rgba(0, 0, 0, 0)',
      'border-color': '#747576',
      'border-style': 'solid',
      'border-width': '1px',
      'color': '#000000'
    },
    'input[type="text"]::placeholder, input[type="email"]::placeholder, input[type="password"]::placeholder, textarea::placeholder': {
      color: '#bdbdbd'
    },
    'select option': {
      color: '#000000'
    },
    'th, td': {
      'border-color': '#e5e7eb',
      'border-style': 'solid',
      'border-width': '1px'
    },
    'th': {
      color: '#000000'
    },
    'tr': {
      'border-bottom-color': '#e5e7eb',
      'border-bottom-style': 'solid',
      'border-bottom-width': '1px'
    },
    'thead': {
      'border-bottom-color': '#e5e7eb',
      'border-bottom-style': 'solid',
      'border-bottom-width': '2px'
    },
    'tfoot': {
      'border-top-color': '#e5e7eb',
      'border-top-style': 'solid',
      'border-top-width': '2px'
    },
    'colgroup': {
      border: 'none'
    },
    'blockquote': {
      'border-left-color': '#e5e7eb',
      'color': '#000000'
    },
    'hr': {
      'border': 'none',
      'background-color': '#e5e7eb'
    },
    'figcaption, caption': {
      color: '#000000'
    },
    'details': {
      'border-color': '#e5e7eb',
      'border-style': 'solid',
      'border-width': '1px'
    },
    'summary': {
      color: '#000000'
    },
    'small': {
      color: '#000000'
    },
    'strong': {
      color: '#000000'
    },
    'em': {
      color: '#000000'
    },
    'ul, ol': {
      color: '#000000'
    },
    'li': {
      color: '#000000'
    },
    'mark': {
      'background-color': 'rgba(247, 209, 84, 0.5)',
      'color': '#000000'
    }
  }
};

function processCSSRules(rules: CSSRuleList, container: { [key: string]: any }, cssVariableReferenceMap: CSSVariableReferenceMap) {
  for (const rule of rules) {
    switch (rule.type) {
      case CSSRule.STYLE_RULE: {
        const styleRule = rule as CSSStyleRule;
        const selectorText = styleRule.selectorText;
        if (!container.hasOwnProperty(selectorText)) {
          container[selectorText] = {};
        }
        const extendedRuleStyle = Array.from(styleRule.style).concat(['background', 'border']);
        for (const prop of extendedRuleStyle) {
          const value = styleRule.style.getPropertyValue(prop).trim();
          if (value !== '') {
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
        processCSSRules(mediaRule.cssRules, container[media], cssVariableReferenceMap);
        break;
      }

      case CSSRule.IMPORT_RULE: {
        const importRule = rule as CSSImportRule;
        if (importRule.styleSheet) {
          // Import rules with nested stylesheets
          try {
            processCSSRules(importRule.styleSheet.cssRules, container, cssVariableReferenceMap);
          } catch (e) {
            // Skipped due to CORS/security
          }
        }
        break;
      }

      case CSSRule.CHARSET_RULE: {
        break;
      }

      case CSSRule.COUNTER_STYLE_RULE: {
        break;
      }

      case CSSRule.FONT_FACE_RULE: {
        break;
      }

      case CSSRule.FONT_FEATURE_VALUES_RULE: {
        break;
      }

      case CSSRule.KEYFRAMES_RULE: {
        break;
      }

      case CSSRule.KEYFRAME_RULE: {
        break;
      }

      case CSSRule.NAMESPACE_RULE: {
        break;
      }

      case CSSRule.PAGE_RULE: {
        break;
      }

      case CSSRule.SUPPORTS_RULE: {
        const supportsRule = rule as CSSSupportsRule;
        const supports = `@supports ${supportsRule.conditionText}`;
        if (!container.hasOwnProperty(supports)) {
          container[supports] = {};
        }
        processCSSRules(supportsRule.cssRules, container[supports], cssVariableReferenceMap);
        break;
      }

      default: {
        // container[`@unknown-${rule.type}`] = rule.cssText;
        break;
      }
    }
  }
}

export function updateStyles(elementsWithInlineStyle: NodeListOf<HTMLElement>, svgElements: NodeListOf<HTMLElement>, styleSheets: StyleSheetList): void {
  // Extract svg presentation attributes
  const SVGPresentationAttributes: StyleSheet = {};

  for (const element of svgElements) {
    const selector = generateElementSelector(element);
    if (!SVGPresentationAttributes.hasOwnProperty(selector)) {
      SVGPresentationAttributes[selector] = {};
    }

    for (const attribute of SVGPresentationAttributesList) {
      const value = element.getAttribute(attribute);

      if (value != null && value.trim() !== '') {
        // Attribute explicitly set on this element
        SVGPresentationAttributes[selector][attribute] = value;
        continue;
      } else {
        // Try to inherit from ancestor in SVGPresentationAttributes
        const inherited = getInheritedPresentationAttribute(element, attribute, SVGPresentationAttributes);
        if (inherited !== undefined) {
          SVGPresentationAttributes[selector][attribute] = inherited;
          continue;
        }
      }
    }
  }

  currentStylesCollection['@stylesheet-svg-presentation-attributes'] = deepAssign(currentStylesCollection['@stylesheet-svg-presentation-attributes'] || {}, SVGPresentationAttributes);

  // Extract external/internal stylesheets
  for (const sheet of styleSheets) {
    try {
      if (!sheet.cssRules) continue;
      if (Array.from(sheet.ownerNode?.attributes || []).some((attr) => attr.name === 'auto-dark-mode-stylesheet-name')) continue;
      const sheetObj = {};
      processCSSRules(sheet.cssRules, sheetObj, cssVariableReferenceMap);
      const identifier = sheet.ownerNode?.id || generateIdentifier();
      const name = sheet.ownerNode?.nodeName.toString().toLowerCase();
      const sheetName = `@stylesheet-${name}-${identifier}`;
      currentStylesCollection[sheetName] = deepAssign(currentStylesCollection[sheetName] || {}, sheetObj);
    } catch (e) {
      // Skipped due to access restrictions
    }
  }

  // Capture all inline stylesCollection (lambda stylesCollection)
  const lambdaStyles: StyleSheet = {};
  for (const element of elementsWithInlineStyle) {
    if (element.style.length > 0) {
      const selector = generateElementSelector(element);

      if (!lambdaStyles.hasOwnProperty(selector)) {
        lambdaStyles[selector] = {};
      }

      for (const prop of element.style) {
        const value = element.style.getPropertyValue(prop).trim();
        if (value !== '') {
          lambdaStyles[selector][prop] = value;
        }
      }
    }
  }

  currentStylesCollection['@stylesheet-lambda'] = deepAssign(currentStylesCollection['@stylesheet-lambda'] || {}, lambdaStyles);
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
        const colors = splitByTopLevelDelimiter(value);
        const colorsLen = colors.result.length;
        for (let i = colorsLen - 1; i >= 0; i--) {
          const color = colors.result[i];
          const parsedColor = parseColor(color);
          if (parsedColor) {
            const invertedColor = invertColor(parsedColor);
            colors.result.splice(i, 1, colorToString(invertedColor));

            if (parsedColor.type === 'rgba' || parsedColor.type === 'rgb') {
              let weight = 0;
              let r = 0;
              let g = 0;
              let b = 0;
              if (parsedColor.type === 'rgba') {
                weight = parsedColor.rgba[3];
                r = (parsedColor.rgba[0] / 255) * weight;
                g = (parsedColor.rgba[1] / 255) * weight;
                b = (parsedColor.rgba[2] / 255) * weight;
              }
              if (parsedColor.type === 'rgb') {
                weight = 1;
                r = (parsedColor.rgb[0] / 255) * weight;
                g = (parsedColor.rgb[1] / 255) * weight;
                b = (parsedColor.rgb[2] / 255) * weight;
              }
              if (key === 'background-color' || key === 'background') {
                backgroundColorRed += r;
                backgroundColorGreen += g;
                backgroundColorBlue += b;
                backgroundColorQuantity += weight;
              }
              if (key === 'color') {
                textColorRed += r;
                textColorGreen += g;
                textColorBlue += b;
                textColorQuantity += weight;
              }
              if (key.startsWith('--')) {
                if (referenceMap.hasOwnProperty(key)) {
                  if (referenceMap[key][0] > referenceMap[key][1]) {
                    backgroundColorRed += r;
                    backgroundColorGreen += g;
                    backgroundColorBlue += b;
                    backgroundColorQuantity += weight;
                  }
                  if (referenceMap[key][0] < referenceMap[key][1]) {
                    textColorRed += r;
                    textColorGreen += g;
                    textColorBlue += b;
                    textColorQuantity += weight;
                  }
                }
              }
            }
          }
        }

        const invertedColors = joinByDelimiters(colors.result, colors.delimiters);
        newStyles[key] = invertedColors;
      } else if (isPreserved(key)) {
        newStyles[key] = value;
      }
    }
  }

  const mainBackgroundColor: ColorRGBA = {
    type: 'rgba',
    rgba: backgroundColorQuantity > 0 ? [(backgroundColorRed / backgroundColorQuantity) * 255, (backgroundColorGreen / backgroundColorQuantity) * 255, (backgroundColorBlue / backgroundColorQuantity) * 255, 1] : [0, 0, 0, 0]
  };

  const mainTextColor: ColorRGBA = {
    type: 'rgba',
    rgba: textColorQuantity > 0 ? [(textColorRed / textColorQuantity) * 255, (textColorGreen / textColorQuantity) * 255, (textColorBlue / textColorQuantity) * 255, 1] : [0, 0, 0, 0]
  };

  const originalTheme = evaluateTheme(mainBackgroundColor, mainTextColor);

  if (originalTheme === 'light') {
    return newStyles;
  } else {
    return {};
  }
}

export function generateCssFromStyles(object: StylesCollection | StyleSheet, nested: boolean = false): StyleSheetCSSArray {
  const results: StyleSheetCSSArray = [];

  let hasBasicRules = false;
  for (const sheet in object) {
    const header = nested ? '' : `/* ${sheet} */`;
    let result = [];
    let basicRules = [];

    for (const selector in object[sheet]) {
      const properties = object[sheet][selector];

      const isObject = typeof properties === 'object' && properties !== null && !Array.isArray(properties);
      if (!isObject || Object.keys(properties).length === 0) {
        continue; // Skip non-object or empty selectors
      }

      const isNestedBlock = selector.startsWith('@') || Object.values(properties).some((v) => typeof v === 'object');

      if (isNestedBlock) {
        const nestedContent = generateCssFromStyles({ nested: properties }, true)
          .map((obj) => obj.css)
          .join('');

        if (nestedContent.trim()) {
          result.push(`${selector}{${nestedContent}}`);
        }
      } else {
        let rule = [];
        let hasRule = false;
        for (const prop in properties) {
          const val = properties[prop];
          rule.push(`${prop}:${val}${sheet === '@stylesheet-lambda' ? '!important' : ''};`);
          hasRule = true;
        }

        if (hasRule) {
          basicRules.push(`${selector}{${rule.join('')}}`);
          hasBasicRules = true;
        }
      }
    }

    if (hasBasicRules) {
      if (nested) {
        result.unshift(basicRules.join(''));
      } else {
        result.unshift(`@media (prefers-color-scheme:dark){${basicRules.join('')}}`);
      }
    }

    results.push({
      name: sheet,
      css: `${header}${result.join('')}`
    });
  }

  return results;
}
