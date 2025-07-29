export function findPropertyValue(root: any, property: string, initialPath: Array<string>, currentPath: Array<string> = [], distance: { value: number } = { value: Infinity }): any | undefined {
  if (typeof root !== 'object' || root === null) return undefined;
  let candidate = undefined;
  for (const key in root) {
    if (typeof root[key] === 'object' && !Array.isArray(root[key])) {
      const value = findPropertyValue(root[key], property, initialPath, currentPath.concat(key), distance);
      if (value !== undefined) {
        candidate = value;
      }
    } else if (key === property) {
      const subDistance = getNodeDistance(currentPath, initialPath);
      if (subDistance < distance.value) {
        distance.value = subDistance;
        return root[key];
      }
    }
  }
  return candidate;
}
