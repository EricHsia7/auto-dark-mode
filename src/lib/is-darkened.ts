const darkenedProperties = {
  'box-shadow': true
};

export function isDarkened(property: string): boolean {
  return darkenedProperties.hasOwnProperty(property);
}
