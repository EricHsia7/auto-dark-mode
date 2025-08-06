export function splitByTopLevelDelimiter(value: string, legalDelimiters = [' ', ',']): { result: Array<string>; delimiters: Array<string> } {
  value = value.trim();
  let leftBracket = 0;
  let rightBracket = 0;
  let start = 0;
  const result = [];
  const delimiters = [];
  const len = value.length;
  for (let i = 0, l = len, l1 = len - 1; i < l; i++) {
    const char = value[i];
    if (char === '(') {
      leftBracket++;
    }
    if (char === ')') {
      rightBracket++;
    }
    if (leftBracket === rightBracket) {
      if (legalDelimiters.indexOf(char) > -1) {
        result.push(value.slice(start, i).trim());
        delimiters.push(char);
        start = i + 1;
      } else if (i === l1) {
        result.push(value.slice(start, i + 1).trim());
        start = i + 1;
      }
    }
  }
  return { result, delimiters };
}
