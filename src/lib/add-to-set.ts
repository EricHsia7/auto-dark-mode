export function addToSet(set: Set<any>, content: Array<any> | any): void {
  if (typeof content === 'object' && Array.isArray(content)) {
    for (const item of content) {
      set.add(item);
    }
  } else {
    set.add(content);
  }
}
