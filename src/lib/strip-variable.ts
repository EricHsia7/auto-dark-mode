export function stripVariable(value: string): string {
  const trimmed = value.trim();
  const variableRegex = /^var\((.*)\)$/i;
  const variableMatches = trimmed.match(variableRegex);
  if (variableMatches) {
    return variableMatches[1];
  } else {
    return trimmed;
  }
}
