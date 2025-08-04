export function isPathContinuous(object: any, path: Array<string>): boolean {
  if (path.length === 0) {
    return true;
  }
  if (typeof object === 'object' && !Array.isArray(object)) {
    const key = path.shift();
    if (key !== undefined && object.hasOwnProperty(key)) {
      return isPathContinuous(object[key], path);
    } else {
      return false;
    }
  } else {
    return false;
  }
}