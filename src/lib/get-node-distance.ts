export function getNodeDistance(path1: Array<string>, path2: Array<string>): number {
  // Check if paths are exactly the same
  if (path1.length === path2.length && path1.every((val, i) => val === path2[i])) {
    return -1;
  }

  // Find common prefix length
  let commonLength = 0;
  while (commonLength < path1.length && commonLength < path2.length && path1[commonLength] === path2[commonLength]) {
    commonLength++;
  }

  // If under the same parent object (e.g., same common path, just different keys)
  if (path1.length === path2.length && commonLength === path1.length - 1) {
    return 0;
  }

  // Distance = steps to go up from path1 to common ancestor + steps down to path2
  const stepsUp = path1.length - commonLength;
  const stepsDown = path2.length - commonLength;

  return stepsUp + stepsDown;
}
