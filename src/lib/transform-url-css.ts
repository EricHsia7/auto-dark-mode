import { resolveRelativeURL } from './resolve-relative-url';

export function transformURLCSS(cssText: string, cssHref: string): string {
  return cssText.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, quote, urlPath) => {
    if (/^(data:|https?:|\/\/:)/.test(urlPath)) {
      // Absolute URL or data URI — do not touch
      return `url(${quote}${urlPath}${quote})`;
    }
    try {
      const resolved = resolveRelativeURL(urlPath, cssHref);
      return `url(${quote}${resolved}${quote})`;
    } catch (e) {
      return match;
    }
  });
}
