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
      number: parseFloat(unitedFloatMatch[1]),
      unit: unitedFloatMatch[2].trim()
    };
  }

  return undefined;
}

export function parseModel(value: string): ModelComponent<string> | ParsingFailed {
  if (isTopLevelModel(value)) {
    const strippedModel = stripTopLevelModel(value);
    const legalDelimiters = cssDelimiters[strippedModel.model] || cssDelimiters['default']; // TODO: separate the map
    const array = splitByTopLevelDelimiter(strippedModel.result, legalDelimiters);

    const parsedComponents = array.result.map((a) => parseComponent(a)).filter((b) => b !== undefined);

    return {
      type: 'model',
      model: strippedModel.model,
      components: parsedComponents
    };
  }

  return undefined;
}

export function parseComponent(value: string): Component | ParsingFailed {
  const parsedNumberComponent = parseNumber(value);
  if (parsedNumberComponent !== undefined) {
    return parsedNumberComponent;
  }

  const parsedModelComponent = parseModel(value);
  if (parsedModelComponent !== undefined) {
    return parsedModelComponent;
  }

  if (value !== '') {
    return {
      type: 'string',
      string: value
    };
  }

  return undefined;
}

export function stringifyComponent(component: Component | ParsingFailed, delimitersMap: { [model: string]: string }): string {
  if (component === undefined) return '';

  if (component.type === 'number') {
    return `${component.number}${component.unit}`;
  }

  if (component.type === 'string') {
    return component.string;
  }

  if (component.type === 'model') {
    // Join subcomponents with a space (or use a delimiter if needed)
    const delimiter = delimitersMap[component.model] || ' ';
    const inner = component.components.map((e) => stringifyComponent(e, delimitersMap)).join(delimiter);
    return `${component.model}(${inner})`;
  }

  return '';
}
