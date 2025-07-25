export function isTopLevelFunction(value: string): boolean {
  const trimmed = value.trim();
  const trimmedLen = trimmed.length;
  let leftBracket = 0;
  let rightBracket = 0;
  let depth = 0;
  let pairs = 0;
  for (let i = 0, l = trimmedLen; i < l; i++) {
    const char = trimmed[i];
    if (char === '(') {
      leftBracket++;
      depth++;
    } else if (char === ')') {
      rightBracket++;
      depth--;
    }
    if (leftBracket === rightBracket && depth === 0 && char === ')') {
      pairs++;
    }
    if (pairs > 1) {
      return false;
    }
  }
  if (pairs === 1) {
    return true;
  } else {
    return false;
  }
}
