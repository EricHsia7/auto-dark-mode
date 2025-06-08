export function isPreserved(property: string): boolean {
  const preservedProperties = ['filter', '-webkit-filter'];
  if (preservedProperties.indexOf(property) > -1) {
    return true;
  } else {
    return false;
  }
}
