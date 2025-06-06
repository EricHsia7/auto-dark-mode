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
  const backgroundColorRGB = backgroundColor.rgba.slice(0, 3);
  const backgroundColorMax = Math.max(...backgroundColorRGB) / 255;
  const backgroundColorMin = Math.min(...backgroundColorRGB) / 255;
  const backgroundColorDelta = backgroundColorMax - backgroundColorMin;
  const backgroundColorSaturation = backgroundColorMax === 0 ? 0 : backgroundColorDelta / backgroundColorMax;
  const backgroundColorValue = backgroundColorMax;

  const textColorRGB = textColor.rgba.slice(0, 3);
  const textColorMax = Math.max(...textColorRGB) / 255;
  const textColorMin = Math.min(...textColorRGB) / 255;
  const textColorDelta = textColorMax - textColorMin;
  const textColorSaturation = textColorMax === 0 ? 0 : textColorDelta / textColorMax;
  const textColorValue = textColorMax;

  if (backgroundColor.rgba[3] === 0 && textColorSaturation < 0.38 && textColorValue < 0.5) {
    return 'light';
  }

  if (backgroundColorValue >= textColorValue && backgroundColorSaturation < 0.38 && textColorSaturation < 0.38) {
    return 'light';
  } else {
    return 'dark';
  }
}
