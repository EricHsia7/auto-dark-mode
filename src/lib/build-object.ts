

function parseFloatNumber(arg) {
  if (/^[-+]?[0-9]*\.?[0-9]+$/.test(arg)) {
    return {
      type: 'float',
      value: parseFloat(arg)
    };
  }
  return undefined;
}

function parseIntegerWithUnit(arg) {
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

function parseFloatWithUnit(arg) {
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

export function buildObject(value: string) {
  // Try primitive parsers first
  const parsed = parseInteger(value) || parseFloatNumber(value) || parseIntegerWithUnit(value) || parseFloatWithUnit(value);

  if (parsed !== undefined) {
    return parsed;
  }

  // Try parsing as a top-level model/function
  if (isTopLevelFunction(value)) {
    const stripped = stripTopLevelFunction(value);
    const legalDelimiters = delimiterMap[stripped.model] || delimiterMap['default'];
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
