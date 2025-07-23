import { resolveRelativeURL } from './resolve-relative-url';

export function transformURLCSS(cssText: string, cssHref: string): string {
  return cssText.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, quote, urlPath) => {
    const resolved = resolveRelativeURL(urlPath, cssHref);
    return `url(${quote}${resolved}${quote})`;
  });
}
