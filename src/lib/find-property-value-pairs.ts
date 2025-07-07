export interface PropertyValuePair {
  start: number;
  end: number;
  property: string;
  value: string;
  terminator: '' | ';';
}

export type PropertyValuePairArray = Array<PropertyValuePair>;

export function findPropertyValuePairs(cssText: string): PropertyValuePairArray {
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
  return propertyValuePairs;
}
