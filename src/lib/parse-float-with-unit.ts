export interface FloatWithUnitObject {
  type: 'float-u';
  value: number;
  unit: string;
}

export function parseFloatWithUnit(arg: string): FloatWithUnitObject | undefined {
  const match = arg.match(/^([-+]?[0-9]*\.?[0-9]+)([a-z%]+)$/i);
  if (match) {
    return {
      type: 'float-u',
      value: parseFloat(match[1]),
      unit: match[2].trim()
    };
  }
  return undefined;
}
