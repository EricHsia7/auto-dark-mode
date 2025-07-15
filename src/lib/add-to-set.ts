export function addToSet(set: Set<any>, content: Array<any> | any, callback: (item: any) => any?): void {
  if (typeof content === 'object' && Array.isArray(content)) {
    if (typeof callback === 'function') {
      for (const item of content) {
        set.add(callback(item));
      }
    } else {
      for (const item of content) {
        set.add(item);
      }
    }
  } else {
    if (typeof callback === 'function') {
      set.add(callback(content));
    } else {
      set.add(content);
    }
  }
}
