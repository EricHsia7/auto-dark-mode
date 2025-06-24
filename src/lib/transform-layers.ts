export function transformLayerCSS(cssText: string, replacementAtRule: string = '@supports (color: #fff)'): string {
  const layerBlocks = {};
  const layerOrder = [];

  // Step 1: Extract global @layer ordering
  cssText = cssText.replace(/@layer\s+([^{};]+?)\s*;/g, (_, layerList) => {
    layerList
      .split(',')
      .map((l) => l.trim())
      .forEach((name) => {
        if (!layerOrder.includes(name)) {
          layerOrder.push(name);
        }
      });
    return ''; // Remove ordering declaration
  });

  // Step 2: Extract @layer blocks with bracket matching
  let resultCSS = '';
  let i = 0;

  while (i < cssText.length) {
    const layerMatch = cssText.slice(i).match(/@layer\s+([\w-\.\_]+)\s*{/);
    if (layerMatch) {
      const fullMatchIndex = i + layerMatch.index;
      const name = layerMatch[1];
      const startIndex = fullMatchIndex + layerMatch[0].length;

      // Find matching closing bracket
      let braceCount = 1;
      let endIndex = startIndex;
      while (endIndex < cssText.length && braceCount > 0) {
        if (cssText[endIndex] === '{') braceCount++;
        else if (cssText[endIndex] === '}') braceCount--;
        endIndex++;
      }

      const content = cssText.slice(startIndex, endIndex - 1).trim();
      if (!layerBlocks[name]) layerBlocks[name] = [];
      layerBlocks[name].push(content);

      // Move pointer past this block
      i = endIndex;
    } else {
      resultCSS += cssText[i];
      i++;
    }
  }

  // Step 3: Reorder and wrap blocks
  const orderedCSS = [];

  layerOrder.forEach((name) => {
    const blocks = layerBlocks[name];
    if (blocks) {
      blocks.forEach((content) => {
        orderedCSS.push(`${replacementAtRule} {\n  /* originally @layer ${name} */\n${content}\n}`);
      });
      delete layerBlocks[name];
    }
  });

  Object.entries(layerBlocks).forEach(([name, blocks]) => {
    blocks.forEach((content) => {
      orderedCSS.push(`${replacementAtRule} {\n  /* originally @layer ${name} */\n${content}\n}`);
    });
  });

  // Combine everything
  return (resultCSS + '\n\n' + orderedCSS.join('\n\n')).trim();
}
