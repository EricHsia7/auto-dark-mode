export function resolveRelativeURLs(cssText: string, cssHref: string): string {
  const base = new URL(cssHref);
  return cssText.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, quote, urlPath) => {
    if (/^(data:|https?:|\/)/.test(urlPath)) {
      // Absolute URL or data URI — do not touch
      return `url(${quote}${urlPath}${quote})`;
    }
    try {
      const resolved = new URL(urlPath, base).href;
      return `url(${quote}${resolved}${quote})`;
    } catch (e) {
      return match;
    }
  });
}
