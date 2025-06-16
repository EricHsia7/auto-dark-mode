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

export function isInvertible(property: string, value: string): boolean {
  const colorRelatedCSSProperties = [
    // General color properties
    'color',
    'background-color',
    'border-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    /*
    'text-shadow',
    'box-shadow',
    */
    // TODO: implement the parser
    'caret-color',
    'column-rule-color',
    'text-decoration-color',
    'text-emphasis-color',

    // Logical border colors
    'border-block-color',
    'border-block-end-color',
    'border-block-start-color',
    'border-inline-color',
    'border-inline-end-color',
    'border-inline-start-color',

    // Filter and blend properties
    /*
    'backdrop-filter',
    'filter',
    */
    'background-image',
    'background-blend-mode',
    'mix-blend-mode',

    // SVG related colors
    'fill',
    'flood-color',
    'lighting-color',
    'stop-color',
    'stroke',
    /*
    'color-interpolation-filters',
    */

    // System/UI colors
    'accent-color',
    'color-scheme',
    'scrollbar-color',
    'font-palette',
    'print-color-adjust',

    // Vendor prefixed properties
    '-webkit-tap-highlight-color',
    '-webkit-border-before-color',
    '-webkit-text-fill-color',
    '-webkit-text-stroke-color',

    // Shorthand properties
    'background',
    'outline',
    /*'text-decoration',*/
    'box-decoration-break',
    'column-rule'
  ];

  if (colorRelatedCSSProperties.indexOf(property) > -1) {
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
