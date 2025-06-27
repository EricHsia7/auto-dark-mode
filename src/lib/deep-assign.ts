export function deepAssign(target, source) {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        target[key] = deepAssign(target[key] || {}, source[key]);
      } else if (Array.isArray(source[key])) {
        target[key] = source[key].map((item) => {
          if (typeof item === 'object' && item !== null) {
            return deepAssign({}, item);
          }
          return item;
        });
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}
