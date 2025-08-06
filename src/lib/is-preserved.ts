const preservedProperties = {
  'filter': true,
  '-webkit-filter': true,
  'background-attachment': true,
  'background-blend-mode': true,
  'background-clip': true,
  'background-origin': true,
  'background-position-x': true,
  'background-position-y': true,
  'background-position': true,
  'background-repeat': true,
  'background-size': true
};

export function isPreserved(property: string): boolean {
  return preservedProperties.hasOwnProperty(property);
}
