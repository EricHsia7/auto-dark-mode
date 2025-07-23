export function resolveRelativeURL(urlPath: string, base: string): string {
  if (/^(data:|https?:|\/\/:)/.test(urlPath)) {
    return urlPath; // already absolute
  } else {
    try {
      return new URL(urlPath, base).href;
    } catch (e) {
      return urlPath;
    }
  }
}
