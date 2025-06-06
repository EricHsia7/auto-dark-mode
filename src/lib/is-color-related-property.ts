import { namedColors } from './named-colors';

function looksLikeColorValue(value: string): boolean {
  value = value.trim().toLowerCase();

  // Check for hex codes
  if (/^#([a-f0-9]{3,4}|[a-f0-9]{6}|[a-f0-9]{8})$/.test(value)) {
    return true;
  }

  // Other formats
  if (/^(rgb|rgba|hsl|hsla|linear-gradient|radial-gradient|conic-gradient)\(/.test(value)) {
    if (!/var\(--.*\)/.test(value) && !/calc\(.*\)/.test(value) && !/clamp\(.*\)/.test(value)) {
      return true;
    }
  }

  // Named colors
  if (namedColors.hasOwnProperty(value.toLowerCase())) {
    return true;
  }

  return false;
}

export function isColorRelatedProperty(property: string, value: string): boolean {
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

  console.log('isColorRelatedProperty', property, value);

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
