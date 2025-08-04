export function isPathContinuous(object: any, path: Array<string>): boolean {
  console.log('a', 0);
  if (path.length === 0) {
    console.log('a', 1);

    return true;
  }
  console.log('a', 2);

  if (typeof object === 'object' && !Array.isArray(object)) {
    console.log('a', 3, path);

    const key = path.shift();
    console.log('a', 4, key, path);

    if (key !== undefined && object.hasOwnProperty(key)) {
      console.log('a', 5);

      return isPathContinuous(object[key], path);
    } else {
      console.log('a', 6);

      return false;
    }
  } else {
    console.log('a', 7);
    return false;
  }
}
