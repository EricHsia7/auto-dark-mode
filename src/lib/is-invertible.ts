import { namedColors } from './named-colors';
import { systemColors } from './system-colors';

function looksLikeColorValue(value: string): boolean {
  value = value.trim().toLowerCase();

  // check for hex codes
  if (/^#([a-f0-9]{3,4}|[a-f0-9]{6}|[a-f0-9]{8})$/i.test(value)) {
    return true;
  }

  // other formats
  if (/^(rgb|rgba|hsl|hsla|hwb|linear-gradient|-webkit-linear-gradient|radial-gradient|-webkit-radial-gradient|conic-gradient|-webkit-conic-gradient|var)\(/i.test(value)) {
    if (!/calc\(.*\)/i.test(value) && !/clamp\(.*\)/i.test(value)) {
      return true;
    }
  }

  // transparent
  if (value.toLowerCase() === 'transparent') {
    return true;
  }

  // currentColor
  if (value.toLowerCase() === 'currentcolor') {
    return true;
  }

  // named colors
  if (namedColors.hasOwnProperty(value.toLowerCase())) {
    return true;
  }

  // system colors
  if (systemColors.hasOwnProperty(value.toLowerCase())) {
    return true;
  }

  return false;
}

const colorRelatedCSSProperties = {
  '-webkit-border-before-color': true,
  '-webkit-tap-highlight-color': true,
  '-webkit-text-fill-color': true,
  '-webkit-text-stroke-color': true,
  'accent-color': true,
  'background-color': true,
  'background-image': true,
  'background': true,
  'border-block-color': true,
  'border-block-end-color': true,
  'border-block-start-color': true,
  'border-color': true,
  'border-inline-color': true,
  'border-inline-end-color': true,
  'border-inline-start-color': true,
  'border-left-color': true,
  'border-right-color': true,
  'border-top-color': true,
  'border-bottom-color': true,
  'box-decoration-break': true,
  'box-shadow': true,
  'caret-color': true,
  'color-scheme': true,
  'color': true,
  'column-rule-color': true,
  'column-rule': true,
  'fill': true,
  'flood-color': true,
  'font-palette': true,
  'lighting-color': true,
  'outline-color': true,
  'outline': true,
  'print-color-adjust': true,
  'scrollbar-color': true,
  'stop-color': true,
  'stroke': true,
  'text-decoration-color': true,
  'text-emphasis-color': true
};

export function isInvertible(property: string, value: string): boolean {
  if (colorRelatedCSSProperties.hasOwnProperty(property)) {
    return true;
  } else {
    if (property.startsWith('--')) {
      // invert css variable definition
      if (looksLikeColorValue(value)) {
        return true;
      }
    }
    return false;
  }
}
