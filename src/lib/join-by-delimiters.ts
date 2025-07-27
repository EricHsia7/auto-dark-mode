export function joinByDelimiters(array: Array<string>, delimiters: Array<string>): string {
  const arrayLen = array.length;
  const delimitersLen = delimiters.length;
  if (arrayLen - 1 === delimitersLen) {
    for (let i = 1, offset = 0, l = arrayLen; i < l; i++, offset++) {
      array.splice(i + offset, 0, delimiters[i - 1]);
    }
    return array.join('');
  } else {
    return array.join(' ');
  }
}
