export function sanitizeURL(url: string): string {
  return (
    url
      .trim()
      // Remove protocol
      .replace(/^https?:\/\//, '')
      // Replace slashes with underscores
      .replace(/[\/\\]+/g, '_')
      // Remove URL parameters and fragments
      .replace(/[?#].*$/, '')
      // Replace invalid characters with dashes
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      // Collapse multiple dashes or underscores
      .replace(/[-_]{2,}/g, '_')
      // Remove leading/trailing separators
      .replace(/^[-_]+|[-_]+$/g, '')
  );
}
