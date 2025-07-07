const systemColors = {
  canvas: true,
  canvastext: true,
  linktext: true,
  visitedtext: true,
  activetext: true,
  buttonface: true,
  buttontext: true,
  field: true,
  fieldtext: true,
  highlight: true,
  highlighttext: true,
  graytext: true,
  mark: true,
  marktext: true,
  selecteditem: true,
  selecteditemtext: true
};

export function isSystemColor(value: string): boolean {
  if (systemColors.hasOwnProperty(value.toLowerCase())) {
    return true;
  } else {
    return false;
  }
}
