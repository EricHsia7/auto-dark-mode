const svgColorPresentationAttributes = {
  fill: true, // Color to fill the shape
  stroke: true, // Color of the stroke
  color: true // Used for `currentColor` keyword and inheritance
};

export function isSVGColorPresentationAttribute(attribute: string): boolean {
  if (svgColorPresentationAttributes.hasOwnProperty(attribute)) {
    return true;
  } else {
    return false;
  }
}
