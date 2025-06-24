export function transformLayerCSS(cssText: string): string {
  if (!/@layer/gim.test(cssText)) {
    return cssText; // keep it as-is if no layers to transform
  }

  const cssTextLen = cssText.length;

  // Extract declared ordering
  let layersSequence = [];
  const orderingRegex = /@layer\s+([^{};]+?)\s*;/i;
  const orderingMatches = cssText.match(orderingRegex);
  if (orderingMatches) {
    layersSequence = orderingMatches[1].split(/[\s,]+/);
  }

  // Extract layer blocks
  const ranges = [];
  let layersList = [];
  let rangesCount = 0;
  const layerBlockRegex = /@layer[\s\n]*([\w\-\_\.]+)[\s\n]*{/g;
  const layerBlockMatches = cssText.match(layerBlockRegex);
  if (layerBlockMatches) {
    let lastIndex = 0;
    for (const layerBlockMatch of layerBlockMatches) {
      const startIndex = cssText.indexOf(layerBlockMatch, lastIndex);
      ranges.push(startIndex);
      layersList.push(layerBlockMatch);
      rangesCount++;
      lastIndex = startIndex;
    }

    ranges.push(cssTextLen);
  }

  const layerBlocks = [];
  for (let i = 0; i < rangesCount; i++) {
    const start = ranges[i];
    const end = ranges[i + 1];
    let leftBracket = 0;
    let rightBracket = 0;
    for (let j = start; j <= end; j++) {
      const char = cssText[j];
      if (char === '{') {
        leftBracket++;
      } else if (char === '}') {
        rightBracket++;
      }
      if (leftBracket === rightBracket) {
        if (char === '}') {
          const head = layersList[i];
          const identifierMatches = head.match(/@layer[\s\n]*([\w\-\_\.]+)[\s\n]*{/i);
          if (identifierMatches) {
            const identifier = identifierMatches[1].trim();
            const index = layersSequence.indexOf(identifier);
            let precedence = 0;
            if (index === -1) {
              precedence = i;
            } else if (index !== 0) {
              precedence = -1 / index;
            } else {
              precedence = -Infinity;
            }
            // The precedence of styles in a layer block are lower than top-level styles
            const trimmed = cssText.slice(start, j + 1).trim();
            const transformed = trimmed.slice(head.length, trimmed.length - 1);
            layerBlocks.push({
              head: head,
              identifier: identifier,
              start: start,
              end: j + 1,
              transformed: transformed,
              precedence: precedence
            });
          }
          break;
        }
      }
    }
  }

  let result = cssText;
  let offset = 0;
  for (const layerBlock of layerBlocks) {
    result = result.slice(0, layerBlock.start + offset).concat(result.slice(layerBlock.end + offset));
    offset -= layerBlock.end - layerBlock.start;
  }

  // this operation will break the ordering of start and end indexes
  // the precedence most be sorted after removing the original blocks
  layerBlocks.sort(function (a, b) {
    return a.precedence - b.precedence;
  });

  if (orderingMatches) {
    result = result.replace(orderingMatches[0], '');
  }

  result = layerBlocks
    .map((e) => e.transformed)
    .join('')
    .concat(result);

  return result;
}
