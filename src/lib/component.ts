import { cssDelimiters } from './css-delimiters';
import { isTopLevelModel } from './is-top-level-model';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';
import { stripTopLevelModel } from './strip-top-level-model';

export interface ModelComponent<T extends string> {
  type: 'model';
  model: T;
  components: Array<Component>;
}

export interface NumberComponent {
  type: 'number';
  number: number;
  // integer: boolean;
  unit: string | '';
}

export interface StringComponent {
  type: 'string';
  string: string;
}

export type Component = NumberComponent | StringComponent | ModelComponent<string>;

export type ParsingFailed = undefined;

export function parseNumber(value: string): NumberComponent | ParsingFailed {
  if (/^[-+]?[0-9]+$/.test(value)) {
    // integer
    return {
      type: 'number',
      number: parseInt(value, 10),
      unit: ''
    };
  }

  if (/^[-+]?[0-9]*\.?[0-9]+$/.test(value)) {
    // float
    return {
      type: 'number',
      number: parseFloat(value),
      unit: ''
    };
  }

  const unitedIntegerMatch = value.match(/^([-+]?[0-9]+)([a-z%]+)$/i);
  if (unitedIntegerMatch) {
    // integer with unit
    return {
      type: 'number',
      number: parseInt(unitedIntegerMatch[1], 10),
      unit: unitedIntegerMatch[2].trim()
    };
  }

  const unitedFloatMatch = value.match(/^([-+]?[0-9]*\.?[0-9]+)([a-z%]+)$/i);
  if (unitedFloatMatch) {
    return {
      type: 'number',
      value: parseFloat(unitedFloatMatch[1]),
      unit: unitedFloatMatch[2].trim()
    };
  }

  return undefined;
}

export function parseModel(value: string): Component | ParsingFailed {
  const parsedNumberComponent = parseNumber(value);
  if (parsedNumberComponent !== undefined) {
    return parsedNumberComponent;
  }

  if (isTopLevelModel(value)) {
    const strippedModel = stripTopLevelModel(value);
    const legalDelimiters = cssDelimiters[strippedModel.model] || cssDelimiters['default'];
    const array = splitByTopLevelDelimiter(strippedModel.result, legalDelimiters);

    const parsedComponents = array.result.map((a) => parseModel(a)).filter((b) => b !== undefined);

    return {
      type: 'model',
      model: strippedModel.model,
      components: parsedComponents
    };
  }

  if (value !== '') {
    return {
      type: 'string',
      string: value
    };
  }

  return undefined;
}
