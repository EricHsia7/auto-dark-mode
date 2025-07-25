export interface IntegerObject {
  type: 'integer';
  value: number;
}

export function parseInteger(arg: string): IntegerObject | undefined {
  if (/^[-+]?[0-9]+$/.test(arg)) {
    return {
      type: 'integer',
      value: parseInt(arg, 10)
    };
  }
  return undefined;
}
