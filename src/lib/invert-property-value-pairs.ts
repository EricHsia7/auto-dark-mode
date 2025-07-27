import { stringifyComponent } from './component';
import { parseCSSModel } from './css-model';
import { invertCSSModel } from './invert-css-model';
import { joinByDelimiters } from './join-by-delimiters';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';

interface PropertyValuePair {
  start: number;
  end: number;
  property: string;
  value: string;
  terminator: '' | ';';
}

type PropertyValuePairArray = Array<PropertyValuePair>;

export function invertPropertyValuePairs(cssText: string): string {
  const propertyValueRegex = /(color|fill|stroke|flood-color|lighting-color|stop-color)\s*:\s*([^;\{\}}]*);?/gi;
  const propertyValueMatches = cssText.match(propertyValueRegex);
  const propertyValuePairs: PropertyValuePairArray = [];
  if (propertyValueMatches) {
    let lastIndex = 0;
    for (const propertyValueMatch of propertyValueMatches) {
      const start = cssText.indexOf(propertyValueMatch, lastIndex);
      const end = start + propertyValueMatch.length;
      const matches = propertyValueMatch.match(/([a-z\-]+)\s*:\s*([^;]*)(;?)/i);
      if (matches) {
        const property = matches[1].trim();
        const value = matches[2].trim();
        const terminator = matches[3].trim();
        propertyValuePairs.push({
          start: start,
          end: end,
          property: property,
          value: value,
          terminator: terminator
        });
      }
      lastIndex = end;
    }
  }

  let result = cssText;
  let offset = 0;
  for (const propertyValuePair of propertyValuePairs) {
    const colors = splitByTopLevelDelimiter(propertyValuePair.value);
    const colorsLen = colors.result.length;
    for (let i = colorsLen - 1; i >= 0; i--) {
      const color = colors.result[i];
      const parsedColor = parseCSSModel(color);
      if (parsedColor !== undefined) {
        const invertedColor = invertCSSModel(parsedColor, false);
        colors.result.splice(i, 1, stringifyComponent(invertedColor));
      }
    }

    const invertedColors = `${propertyValuePair.property}:${joinByDelimiters(colors.result, colors.delimiters)}${propertyValuePair.terminator}`;
    result = result
      .slice(0, propertyValuePair.start + offset)
      .concat(invertedColors)
      .concat(result.slice(propertyValuePair.end + offset));
    offset += invertedColors.length - (propertyValuePair.end - propertyValuePair.start);
  }

  return result;
}
