export function stripVendorPrefix(model: string): string {
  return model.replace(/^\-(webkit|moz|o|ms)\-/gi, '');
}
