import { cssDelimiters } from './css-delimiters';
import { FloatObject, parseFloatNumber } from './parse-float';
import { FloatWithUnitObject, parseFloatWithUnit } from './parse-float-with-unit';
import { IntegerObject, parseInteger } from './parse-integer';
import { IntegerWithUnitObject, parseIntegerWithUnit } from './parse-integer-with-unit';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';
import { stripTopLevelFunction } from './strip-top-level-function';

export interface StringObject {
  type: 'string';
  value: string;
}

export interface ModelObject {
  type: 'model';
  model: string;
  args: Array<_Object>;
}

export type _Object = IntegerObject | FloatObject | IntegerWithUnitObject | FloatWithUnitObject | StringObject | ModelObject;

export function buildObject(value: string): _Object {
  // Try primitive parsers first
  const parsed = parseInteger(value) || parseFloatNumber(value) || parseIntegerWithUnit(value) || parseFloatWithUnit(value);

  if (parsed !== undefined) {
    return parsed;
  }

  // Try parsing as a top-level model/function
  if (isTopLevelFunction(value)) {
    const stripped = stripTopLevelFunction(value);
    const legalDelimiters = cssDelimiters[stripped.model] || cssDelimiters['default'];
    const args = splitByTopLevelDelimiter(stripped.result, legalDelimiters);

    const parsedArgs = args.result.map((arg) => buildObject(arg)).filter((arg) => arg !== undefined);

    return {
      type: 'model',
      model: stripped.model,
      args: parsedArgs
    };
  }

  // Fallback to plain string
  if (value !== '') {
    return {
      type: 'string',
      value: value
    };
  }

  return undefined;
}
