const preservedProperties = {
  'filter': true,
  '-webkit-filter': true
};

export function isPreserved(property: string): boolean {
  if (preservedProperties.hasOwnProperty(property)) {
    return true;
  } else {
    return false;
  }
}
