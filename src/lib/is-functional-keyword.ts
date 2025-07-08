const functionalKeywords = {
  currentcolor: true,
  inherit: true,
  initial: true,
  revert: true,
  unset: true,
  none: true
};

export function isFunctionalKeyword(value: string): boolean {
  if (functionalKeywords.hasOwnProperty(value.toLowerCase())) {
    return true;
  } else {
    return false;
  }
}
