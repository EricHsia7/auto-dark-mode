const svgElements = {
  svg: true,
  path: true,
  rect: true,
  circle: true,
  ellipse: true,
  polygon: true,
  line: true,
  polyline: true,
  g: true,
  text: true,
  tspan: true,
  textPath: true,
  stop: true
};

// export type SvgElements = NodeListOf<SVGElement | SVGPathElement | SVGRectElement | SVGCircleElement | SVGEllipseElement | SVGPolygonElement | SVGLineElement | SVGPolylineElement | SVGGElement | SVGTextElement | SVGTSpanElement | SVGTextPathElement | SVGStopElement>;

export function isSVGElement(tag: string): boolean {
  if (svgElements.hasOwnProperty(tag.toLowerCase())) {
    return true;
  } else {
    return false;
  }
}

export const svgElementsQuerySelectorString = 'svg, svg path, svg rect, svg circle, svg ellipse, svg polygon, svg line, svg polyline, svg g, svg text, svg tspan, svg textPath, svg stop';
