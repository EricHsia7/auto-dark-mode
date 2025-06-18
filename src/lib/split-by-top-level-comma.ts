export function splitByTopLevelComma(value: string): Array<string> {
  value = value.trim();
  let leftBracket = 0;
  let rightBracket = 0;
  let start = 0;
  const result: Array<string> = [];
  const len = value.length;
  const len1 = len - 1;
  for (let i = 0; i < len; i++) {
    const char = value[i];
    if (char === '(') {
      leftBracket += 1;
    }
    if (char === ')') {
      rightBracket += 1;
    }
    if (leftBracket === rightBracket) {
      if (char === ',' || i === len1) {
        result.push(value.slice(start, i + 1));
        start = i + 1;
      }
    }
  }
  return result;
}
