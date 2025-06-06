export function getDefaultValue(property: string): string | false {
  const defaultValues: { [property: string]: string } = {
    color: '#000000'
    /* 'background-color': 'rgba(0, 0, 0, 0)'*/
  };

  if (defaultValues.hasOwnProperty(property)) {
    return defaultValues[property];
  } else {
    return false;
  }
}
