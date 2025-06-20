const svgElements = {
  svg: true,
  path: true,
  rect: true,
  circle: true,
  ellipse: true,
  polygon: true,
  line: true,
  polyline: true,
  g: true
};

export function isSVGElement(tag: string): boolean {
  if (svgElements.hasOwnProperty(tag.toLowerCase())) {
    return true;
  } else {
    return false;
  }
}
