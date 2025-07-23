export function resolveRelativeURL(urlPath: string, base: string): string {
  if (/^(data:|https?:|\/\/:)/.test(urlPath)) {
    return urlPath; // already absolute
  } else {
    return new URL(urlPath, base).href;
  }
}
