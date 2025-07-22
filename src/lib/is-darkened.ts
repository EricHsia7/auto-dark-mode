const darkenedProperties = {
  'box-shadow': true
};

export function isDarkened(property: string): boolean {
  if (darkenedProperties.hasOwnProperty(property)) {
    return true;
  } else {
    return false;
  }
}
