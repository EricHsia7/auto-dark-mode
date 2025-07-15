export function findStyleSheetByNode(node: any): CSSStyleSheet | null {
  for (let i = document.styleSheets.length - 1; i >= 0; i--) {
    const sheet = document.styleSheets[i];
    if (sheet.ownerNode === node) {
      return sheet;
    }
  }
  return null;
}
