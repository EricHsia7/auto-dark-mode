export interface FloatObject {
  type: 'float';
  value: number;
}

export function parseFloatNumber(arg: string): FloatObject | undefined {
  if (/^[-+]?[0-9]*\.?[0-9]+$/.test(arg)) {
    return {
      type: 'float',
      value: parseFloat(arg)
    };
  }
  return undefined;
}
