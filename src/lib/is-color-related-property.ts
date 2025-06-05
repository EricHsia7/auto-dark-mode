export function isColorRelatedProperty(value: string): boolean {
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
  if (colorRelatedCSSProperties.indexOf(value) > -1) {
    return true;
  } else {
    return false;
  }
}
