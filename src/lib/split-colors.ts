export function splitColors(value: string): Array<string> {
  value = value.trim();
  let leftBracket = 0;
  let rightBracket = 0;
  let current = '';
  const result: Array<string> = [];
  const len = value.length;
  for (let i = 0; i < len; i++) {
    const char = value[i];
    current += char;
    if (char === '(') {
      leftBracket += 1;
    }
    if (char === ')') {
      rightBracket += 1;
    }
    if (leftBracket === rightBracket) {
      if (char === ',' || i === len - 1) {
        result.push(current);
        current = '';
      }
    }
  }
  return result;
}
