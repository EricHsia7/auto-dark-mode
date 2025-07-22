const darkenedProperties = {
  'box-shadow': true
};

export function isDarkened(key: string): boolean {
  if (darkenedProperties.hasOwnProperty(key)) {
    return true;
  } else {
    return false;
  }
}
