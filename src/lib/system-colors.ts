import { Color, parseColor } from './color';

export type SystemColorsTable = {
  [keyword: string]: Color;
};

export function getSystemColors(): SystemColorsTable {
  const table: SystemColorsTable = {};
  const list = ['canvas', 'canvastext', 'linktext', 'visitedtext', 'activetext', 'buttonface', 'buttontext', 'field', 'fieldtext', 'highlight', 'highlighttext', 'graytext', 'mark', 'marktext', 'selecteditem', 'selecteditemtext'];

  const computedStyles = getComputedStyle(document.documentElement);
  for (const keyword of list) {
    const name = `--auto-dark-mode-system-color-${keyword}`;
    const value = computedStyles.getPropertyValue(name).trim();
    table[keyword] = parseColor(value);
  }

  return table;
}

export const systemColorsTable = getSystemColors();
