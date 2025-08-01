export function isTopLevelModel(value: string): boolean {
  const trimmed = value.trim();
  const trimmedLen = trimmed.length;
  let leftBracket = 0;
  let rightBracket = 0;
  let depth = 0;
  let pairs = 0;
  let lastRightBracketIndex = -1;
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
      lastRightBracketIndex = i;
    }
    if (pairs > 1) {
      return false;
    }
  }
  if (pairs === 1) {
    // Check for any non-whitespace after the last closing parenthesis
    if (trimmedLen - 1 > lastRightBracketIndex) {
      return false;
    }
    return true;
  } else {
    return false;
  }
}
