import { isColorDark, ColorRGBA } from './parse-color';

export type theme = 'light' | 'dark';

export function evaluateTheme(backgroundColor: ColorRGBA, textColor: ColorRGBA): theme {
  if (backgroundColor.rgba[3] === 0 && isColorDark(textColor) > 0.6) {
    return 'light';
  }

  if (textColor.rgba[3] === 0 && isColorDark(backgroundColor) < 0.4) {
    return 'light';
  }

  if (isColorDark(textColor) > isColorDark(backgroundColor)) {
    return 'light';
  } else {
    return 'dark';
  }
}
