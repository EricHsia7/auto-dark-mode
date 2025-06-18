import { namedColors } from './named-colors';

function looksLikeColorValue(value: string): boolean {
  value = value.trim().toLowerCase();

  // check for hex codes
  if (/^#([a-f0-9]{3,4}|[a-f0-9]{6}|[a-f0-9]{8})$/i.test(value)) {
    return true;
  }

  // other formats
  if (/^(rgb|rgba|hsl|hsla|linear-gradient|-webkit-linear-gradient|radial-gradient|-webkit-radial-gradient|conic-gradient|-webkit-conic-gradient)\(/i.test(value)) {
    if (!/var\(--.*\)/i.test(value) && !/calc\(.*\)/i.test(value) && !/clamp\(.*\)/i.test(value)) {
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

  return false;
}

const colorRelatedCSSProperties = {
  // General color properties
  'color': true,
  'background-color': true,
  'border-color': true,
  'border-top-color': true,
  'border-right-color': true,
  'border-bottom-color': true,
  'border-left-color': true,
  'outline-color': true,
  /*
    'text-shadow',
    'box-shadow',
    */
  // TODO: implement the parser
  'caret-color': true,
  'column-rule-color': true,
  'text-decoration-color': true,
  'text-emphasis-color': true,

  // Logical border colors
  'border-block-color': true,
  'border-block-end-color': true,
  'border-block-start-color': true,
  'border-inline-color': true,
  'border-inline-end-color': true,
  'border-inline-start-color': true,

  // Filter and blend properties
  /*
    'backdrop-filter',
    'filter',
    */
  'background-image': true,
  'background-blend-mode': true,
  'mix-blend-mode': true,

  // SVG related colors
  'fill': true,
  'flood-color': true,
  'lighting-color': true,
  'stop-color': true,
  'stroke': true,
  /*
    'color-interpolation-filters',
    */

  // System/UI colors
  'accent-color': true,
  'color-scheme': true,
  'scrollbar-color': true,
  'font-palette': true,
  'print-color-adjust': true,

  // Vendor prefixed properties
  '-webkit-tap-highlight-color': true,
  '-webkit-border-before-color': true,
  '-webkit-text-fill-color': true,
  '-webkit-text-stroke-color': true,

  // Shorthand properties
  'background': true,
  'outline': true,
  /*'text-decoration',*/
  'box-decoration-break': true,
  'column-rule': true
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
