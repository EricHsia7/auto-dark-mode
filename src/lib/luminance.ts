import { ParsedColorRGBA } from './parse-color';

export function calculateRelativeLuminance(color: ParsedColorRGBA): number {
  function calculateScalar(value: number): number {
    if (value <= 0.03928) {
      return value / 12.92;
    } else {
      return Math.pow((value + 0.055) / 1.055, 2.4);
    }
  }

  const r: number = color.rgba[0] / 255;
  const g: number = color.rgba[1] / 255;
  const b: number = color.rgba[2] / 255;

  const R: number = calculateScalar(r);
  const G: number = calculateScalar(g);
  const B: number = calculateScalar(b);
  const L: number = 0.2126 * R + 0.7152 * G + 0.0722 * B;

  return L;
}

export type theme = 'light' | 'dark';

export function evaluateTheme(backgroundColor: ParsedColorRGBA, textColor: ParsedColorRGBA): theme {
  const L1: number = calculateRelativeLuminance(backgroundColor);
  const L2: number = calculateRelativeLuminance(textColor);
  const contrast: number = (L1 + 0.05) / (L2 + 0.05);
  if (backgroundColor.rgba[3] === 0 || textColor.rgba[3] === 0) {
    return 'light';
  }
  if (contrast > 1 / contrast) {
    return 'light';
  }
  if (1 / contrast > contrast) {
    return 'dark';
  }
}
