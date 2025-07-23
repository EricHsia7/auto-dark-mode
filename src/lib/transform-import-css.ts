import { joinByDelimiters } from './join-by-delimiters';
import { resolveRelativeURL } from './resolve-relative-url';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';

export function transformImportCSS(cssText: string, cssHref: string): string {
  if (!/@import|"[^"]*"|'[^']*'|url\(\s*(['"]?)([^'")]+)\1\s*\)/gim.test(cssText)) {
    return cssText; // keep it as-is if no urls to transform
  }

  const cssTextLen = cssText.length;

  // Extract import statements
  const ranges = [];
  let rangesCount = 0;
  const importStatementRegex = /@import[\s\n]*([^\{\};]*)[\s\n]*(;)/gi;
  const importStatementMatches = cssText.match(importStatementRegex);
  if (importStatementMatches) {
    let lastIndex = 0;
    for (const importStatementMatch of importStatementMatches) {
      const startIndex = cssText.indexOf(importStatementMatch, lastIndex);
      ranges.push(startIndex);
      rangesCount++;
      lastIndex = startIndex;
    }

    ranges.push(cssTextLen);
  }

  const importStatements = [];
  for (let i = 0; i < rangesCount; i++) {
    const start = ranges[i];
    const end = ranges[i + 1];
    let leftBracket = 0;
    let rightBracket = 0;
    let doubleQuote = 0;
    let singleQuote = 0;
    for (let j = start; j <= end; j++) {
      const char = cssText[j];
      if (char === '(') {
        leftBracket++;
      } else if (char === ')') {
        rightBracket++;
      } else if (char === '"' && singleQuote % 2 === 0) {
        doubleQuote++;
      } else if (char === "'" && doubleQuote % 2 === 0) {
        singleQuote++;
      }
      if (leftBracket === rightBracket && doubleQuote % 2 === 0 && singleQuote % 2 === 0) {
        if (char === ';') {
          const trimmed = cssText.slice(start, j + 1).trim();
          const trimmedLen = trimmed.length;
          const content = trimmed.slice(7, trimmedLen - 1);
          const values = splitByTopLevelDelimiter(content);
          for (let k = values.result.length - 1; k >= 0; k--) {
            const value = values.result[k];
            const matches = value.match(/^((")([^"]*)\2|(')([^']*)\4|url\(\s*(['"]?)([^'")]+)\6\s*\))/i);
            if (matches) {
              const urlPath = matches[7] || matches[3];
              const quote = matches[6] || matches[2] || '';
              const resolved = resolveRelativeURL(urlPath, cssHref);
              values.result.splice(k, 1, `url(${quote}${resolved}${quote})`);
              break;
            }
          }
          const resolvedValues = joinByDelimiters(values.result, values.delimiters);
          importStatements.push({
            start: start,
            end: j + 1,
            transformed: `@import ${resolvedValues};`
          });
          break;
        }
      }
    }
  }

  let result = cssText;
  let offset = 0;
  for (const importStatement of importStatements) {
    result = result
      .slice(0, importStatement.start + offset)
      .concat(importStatement.transformed)
      .concat(result.slice(importStatement.end + offset));
    offset += importStatement.transformed.length - (importStatement.end - importStatement.start);
  }

  return result;
}
