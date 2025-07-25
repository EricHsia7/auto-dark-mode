export interface IntegerWithUnitObject {
  type: 'integer-u';
  value: number;
  unit: string;
}

export function parseIntegerWithUnit(arg: string): IntegerWithUnitObject | undefined {
  const match = arg.match(/^([-+]?[0-9]+)([a-z%]+)$/i);
  if (match) {
    return {
      type: 'integer-u',
      value: parseInt(match[1], 10),
      unit: match[2].trim()
    };
  }
  return undefined;
}
