import { stringifyComponent } from './component';
import { cssPrimaryDelimiters } from './css-delimiters';
import { parseCSSModel } from './css-model';
import { deepAssign } from './deep-assign';
import { evaluateTheme } from './evaluate-theme';
import { extractRGBA } from './extract-rgba';
import { generateElementSelector } from './generate-element-selector';
import { generateIdentifier } from './generate-identifier';
import { getInheritedPresentationAttribute } from './get-inherited-presentation-attribute';
import { invertCSSModel } from './invert-css-model';
import { isDarkened } from './is-darkened';
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

export type CSSVariableReferenceStats = {
  [cssVariableKey: string]: [backgroundColorCount: number, textColorCount: number];
};

export interface Styles {
  stylesCollection: StylesCollection;
  referenceStats: CSSVariableReferenceStats;
}

export interface StyleSheetCSSItem {
  css: string;
  name: string;
}

export type StyleSheetCSSArray = Array<StyleSheetCSSItem>;

export let cssVariableReferenceStats: CSSVariableReferenceStats = {};
export let currentStylesCollection: StylesCollection = {
  '@stylesheet-default': {
    'body': {
      'background-color': '#ffffff',
      'color': '#000000'
    },
    'section, header, main, footer, article': {
      color: '#000000'
    },
    'h1, h2, h3, h4, h5, h6, span, time': {
      'background-color': 'rgba(0, 0, 0, 0)',
      'color': '#000000'
    },
    'a, a:hover': {
      'background-color': 'rgba(0, 0, 0, 0)',
      'color': '#3b82f6'
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
export let currentVariableLibrary = {};
export let currentVariableLengthMap = {};

function processCSSRules(rules: CSSRuleList, container: { [key: string]: any }, referenceStats: CSSVariableReferenceStats, variableLibrary, variableLengthMap, mediaQueryConditions: Array<string> = []) {
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
          const priority = styleRule.style.getPropertyPriority(prop);
          if (value !== '') {
            container[selectorText][prop] = `${value}${priority === 'important' ? ' !important' : ''}`;
            // Check if value refers to CSS variables
            const cssVariableNameMatches = value.match(/--[a-z0-9_-]+/i);
            if (cssVariableNameMatches !== null) {
              for (const cssVariableName of cssVariableNameMatches) {
                if (!referenceStats.hasOwnProperty(cssVariableName)) {
                  referenceStats[cssVariableName] = [0, 0];
                }
                if (prop === 'background' || prop === 'background-color') {
                  referenceStats[cssVariableName][0] += 1;
                }
                if (prop === 'color') {
                  referenceStats[cssVariableName][1] += 1;
                }
              }
            }

            if (prop.startsWith('--')) {
              if (mediaQueryConditions.length > 0) {
                const joinedMediaQueryConditions = `@media ${mediaQueryConditions.join(' and ')}`;
                if (!variableLibrary.hasOwnProperty(joinedMediaQueryConditions)) {
                  variableLibrary[joinedMediaQueryConditions] = {};
                }
                if (!variableLibrary[joinedMediaQueryConditions].hasOwnProperty(selectorText)) {
                  variableLibrary[joinedMediaQueryConditions][selectorText] = {};
                }
                const args = splitByTopLevelDelimiter(value);
                const argsLen = args.result.length;
                if (argsLen > 1) {
                  variableLengthMap[joinedMediaQueryConditions][selectorText][prop] = argsLen;
                  for (let i = argsLen - 1; i >= 0; i--) {
                    variableLibrary[joinedMediaQueryConditions][selectorText][`--varlib-${prop}-${i.toString()}`] = args.result[i];
                  }
                } /* else {
                  variableLibrary[joinedMediaQueryConditions][selectorText][prop] = value;
                } */
              } else {
                if (!variableLibrary.hasOwnProperty(selectorText)) {
                  variableLibrary[selectorText] = {};
                }
                const args = splitByTopLevelDelimiter(value);
                const argsLen = args.result.length;
                if (argsLen > 1) {
                  variableLengthMap[selectorText][prop] = argsLen;
                  for (let i = argsLen - 1; i >= 0; i--) {
                    variableLibrary[selectorText][`--varlib-${prop}-${i.toString()}`] = args.result[i];
                  }
                } /* else {
                  variableLibrary[selectorText][prop] = value;
                } */
              }
            }
          }
        }
        break;
      }

      case CSSRule.MEDIA_RULE: {
        const mediaRule = rule as CSSMediaRule;
        // if (!/prefers-color-scheme:[\s]*dark/i.test(mediaRule.conditionText)) {
        const media = `@media ${mediaRule.conditionText}`;
        if (!container.hasOwnProperty(media)) {
          container[media] = {};
        }
        processCSSRules(mediaRule.cssRules, container[media], referenceStats, variableLibrary, variableLengthMap, mediaQueryConditions.concat(mediaRule.conditionText));
        // }
        // TODO: evaluate theme per color scheme
        break;
      }

      case CSSRule.IMPORT_RULE: {
        const importRule = rule as CSSImportRule;
        if (importRule.styleSheet) {
          // Import rules with nested stylesheets
          try {
            processCSSRules(importRule.styleSheet.cssRules, container, referenceStats, variableLibrary, variableLengthMap);
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
        processCSSRules(supportsRule.cssRules, container[supports], referenceStats, variableLibrary, variableLengthMap);
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
      const identifier = sheet.ownerNode?.id || generateIdentifier();
      const name = sheet.ownerNode?.nodeName.toString().toLowerCase();
      const sheetName = `@stylesheet-${name}-${identifier}`;
      if (sheet.disabled) {
        currentStylesCollection[sheetName] = {};
      } else {
        const sheetObj = {};
        processCSSRules(sheet.cssRules, sheetObj, cssVariableReferenceStats, currentVariableLibrary, currentVariableLengthMap);
        currentStylesCollection[sheetName] = deepAssign(currentStylesCollection[sheetName] || {}, sheetObj);
      }
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
        // const priority = element.style.getPropertyPriority(prop);
        if (value !== '') {
          lambdaStyles[selector][prop] = value;
        }
      }
    }
  }

  currentStylesCollection['@stylesheet-lambda'] = deepAssign(currentStylesCollection['@stylesheet-lambda'] || {}, lambdaStyles);
}

export function invertStyles(object: StylesCollection | StyleSheet | CSSProperties, referenceStats: CSSVariableReferenceStats, path: string[] = []): CSSProperties | StyleSheet | StylesCollection {
  const newStyles: any = {};
  let backgroundColorRed = 0;
  let backgroundColorGreen = 0;
  let backgroundColorBlue = 0;
  let backgroundColorAlpha = 0;

  let textColorRed = 0;
  let textColorGreen = 0;
  let textColorBlue = 0;
  let textColorAlpha = 0;

  // let quantity = 0;

  for (const key in object) {
    const value = object[key];
    const currentPath = path.concat(key);

    if (typeof value === 'object' && value !== null) {
      newStyles[key] = invertStyles(value, referenceStats, currentPath); // Recursive copy
    } else {
      // Leaf node: reached a CSS property/value pair
      const selectorText = currentPath[currentPath.length - 2];
      if (isInvertible(key, value)) {
        const colors = splitByTopLevelDelimiter(value);
        const colorsLen = colors.result.length;
        for (let i = colorsLen - 1; i >= 0; i--) {
          const color = colors.result[i];
          const parsedColor = parseCSSModel(color);
          if (parsedColor !== undefined) {
            const [r, g, b, a] = extractRGBA(parsedColor); // Extraction must occur before inverting because Array.prototype.splice() modifies arrays in place (array objects are mutable)
            const darkened = isDarkened(key);
            let usedVariables = {};
            const invertedColor = invertCSSModel(parsedColor, darkened, true, selectorText, [], currentVariableLibrary, currentVariableLengthMap, usedVariables);
            // TODO: media query conditions
            colors.result.splice(i, 1, stringifyComponent(invertedColor, cssPrimaryDelimiters));

            if (a !== 0) {
              if (key === 'background-color' || key === 'background') {
                backgroundColorRed += (r * a) / 255;
                backgroundColorGreen += (g * a) / 255;
                backgroundColorBlue += (b * a) / 255;
                backgroundColorAlpha += a;
              } else if (key === 'color') {
                textColorRed += (r * a) / 255;
                textColorGreen += (g * a) / 255;
                textColorBlue += (b * a) / 255;
                textColorAlpha += a;
              } else if (key.startsWith('--')) {
                if (referenceStats.hasOwnProperty(key)) {
                  if (referenceStats[key][0] > referenceStats[key][1]) {
                    backgroundColorRed += (r * a) / 255;
                    backgroundColorGreen += (g * a) / 255;
                    backgroundColorBlue += (b * a) / 255;
                    backgroundColorAlpha += a;
                  }
                  if (referenceStats[key][0] < referenceStats[key][1]) {
                    textColorRed += (r * a) / 255;
                    textColorGreen += (g * a) / 255;
                    textColorBlue += (b * a) / 255;
                    textColorAlpha += a;
                  }
                }
              }
              // quantity++;
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

  const mainBackgroundColor = backgroundColorAlpha > 0 ? [(backgroundColorRed / backgroundColorAlpha) * 255, (backgroundColorGreen / backgroundColorAlpha) * 255, (backgroundColorBlue / backgroundColorAlpha) * 255, 1] : [0, 0, 0, 0];
  const mainTextColor = textColorAlpha > 0 ? [(textColorRed / textColorAlpha) * 255, (textColorGreen / textColorAlpha) * 255, (textColorBlue / textColorAlpha) * 255, 1] : [0, 0, 0, 0];

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
