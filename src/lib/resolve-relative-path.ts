export function resolveRelativePath(url: string): string {
  const baseURL = resolveRelativePath.baseURL || (resolveRelativePath.baseURL = window.location.href);
  const resolved = new URL(url, baseURL).href;
  return resolved;
}
