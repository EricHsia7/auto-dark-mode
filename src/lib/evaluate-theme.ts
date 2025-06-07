import { isParsedColorDark, ParsedColorRGBA } from './parse-color';

export type theme = 'light' | 'dark';

export function evaluateTheme(backgroundColor: ParsedColorRGBA, textColor: ParsedColorRGBA): theme {
  if (backgroundColor.rgba[3] === 0 && isParsedColorDark(textColor) > 0.6) {
    return 'light';
  }

  if (textColor.rgba[3] === 0 && isParsedColorDark(backgroundColor) < 0.4) {
    return 'light';
  }

  if (isParsedColorDark(textColor) > isParsedColorDark(backgroundColor)) {
    return 'light';
  } else {
    return 'dark';
  }
}
