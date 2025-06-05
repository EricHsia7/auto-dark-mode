import { namedColors } from './named-colors';

export interface ParsedColorRGBA {
  type: 'rgba';
  rgba: [red: number, green: number, blue: number, alpha: number];
}

export interface ParsedColorVariable {
  type: 'variable';
  ref: string; // var(--name)
}

export interface ParsedColorStop {
  type: 'stop';
  color: ParsedColorRGBA | ParsedColorVariable;
  position: string;
}

export type ParsedColorStopArray = Array<ParsedColorStop>;

export interface ParsedColorLinearGradient {
  type: 'linear-gradient';
  direction: string;
  colorStops: ParsedColorStopArray;
}

export interface ParsedColorRdialGradient {
  type: 'radial-gradient';
  shape: string;
  size: string;
  position: string;
  colorStops: ParsedColorStopArray;
}

export interface ParsedColorConicGradient {
  type: 'conic-gradient';
  angle: string;
  colorStops: ParsedColorStopArray;
}

export interface ParsedColorURL {
  type: 'url';
  ref: string; // url(https://example.com/example.png)
}

export type ParsedColor = ParsedColorRGBA | ParsedColorVariable | ParsedColorLinearGradient | ParsedColorRdialGradient | ParsedColorConicGradient | ParsedColorURL;

export function parseColor(value: string): ParsedColor {
  function parseColorStops(components: Array<string>): ParsedColorStopArray {
    const positionRegex = /(\d+(cm|mm|in|px|pt|pc|rem|ex|ch|em|vw|vh|vmin|vmax|%))$/;
    const colorStops: ParsedColorStopArray = [];
    for (const component of components) {
      const trimmedComponent = component.trim();
      const matches = trimmedComponent.match(positionRegex);
      if (matches) {
        const color = parseColor(trimmedComponent.replace(positionRegex, '').trim()) as ParsedColorRGBA | ParsedColorVariable;
        const position = matches[0].trim();
        colorStops.push({
          type: 'stop',
          color: color,
          position: position
        });
      }
    }
    return colorStops;
  }

  if (value.startsWith('var(')) {
    const result: ParsedColorVariable = {
      type: 'variable',
      ref: value
    };
    return result;
  }

  // handle rgb/rgba
  if (value.startsWith('rgb')) {
    const matches = value.match(/rgba?\((\d+),\s{0,}(\d+),\s{0,}(\d+)(?:,\s{0,}(\d+\.?\d*))?\)/);
    if (!matches) throw new Error(`Invalid RGB/RGBA format: ${value}`);
    const r = parseInt(matches[1], 10);
    const g = parseInt(matches[2], 10);
    const b = parseInt(matches[3], 10);
    const a = matches[4] !== undefined ? parseFloat(matches[4]) : 1;
    const result: ParsedColorRGBA = {
      type: 'rgba',
      rgba: [r, g, b, a]
    };
    return result;
  }

  // handle hex color
  if (value.startsWith('#')) {
    const colorLength = value.length;
    let red: number = 0;
    let green: number = 0;
    let blue: number = 0;

    if (colorLength === 4) {
      // #fff
      red = parseInt(value[1] + value[1], 16);
      green = parseInt(value[2] + value[2], 16);
      blue = parseInt(value[3] + value[3], 16);
    } else if (colorLength === 7) {
      // #ffffff
      red = parseInt(value.slice(1, 3), 16);
      green = parseInt(value.slice(3, 5), 16);
      blue = parseInt(value.slice(5, 7), 16);
    } else {
      throw new Error('Invalid hex format');
    }
    const result: ParsedColorRGBA = {
      type: 'rgba',
      rgba: [red, green, blue, 1]
    };
    return result;
  }

  // handle linear gradient
  if (value.startsWith('linear-gradient')) {
    // Regular expression to match the linear-gradient function
    const regex = /linear-gradient\((.*)\)/;
    const matches = value.match(regex);

    if (!matches || matches.length < 2) {
      throw new Error('Invalid linear gradient string');
    }

    // Extract the content inside the linear-gradient function
    const gradientContent = matches[1];

    // Split the content by commas, but ignore commas inside parentheses
    const components = gradientContent.split(/,(?![^\(]*\))/);

    // Determine if the first part is a direction or a color stop
    let direction;
    if (components[0].trim().match(/^\d+deg$|^to /)) {
      direction = components.shift().trim();
    } else {
      direction = 'to bottom'; // default direction if not specified
    }

    // Process remaining parts as color stops
    const colorStops = parseColorStops(components);

    const result: ParsedColorLinearGradient = {
      type: 'linear-gradient',
      direction: direction,
      colorStops: colorStops
    };

    return result;
  }

  // handle radial gradient
  if (value.startsWith('radial-gradient')) {
    // Give the default values
    let shape = 'circle';
    let size = 'farthest-corner';
    let position = 'center';

    // Regular expression to match the radial-gradient function
    const regex = /radial-gradient\((.*)\)/i;
    const matches = value.match(regex);

    if (!matches) {
      throw new Error('Invalid radial gradient string');
    }

    // Split the content by commas, but ignore commas inside parentheses
    const gradientContent = matches[1];
    const components = gradientContent.split(/,(?![^\(]*\))/);

    let index: number = 0;

    // Check for shape and size (e.g., "circle", "ellipse", "circle closest-side", etc.)
    const shapeSizePattern = /^\s*(circle|ellipse|closest-side|farthest-side|closest-corner|farthest-corner|contain|cover)?\s*(circle|ellipse|closest-side|farthest-side|closest-corner|farthest-corner|contain|cover)?\s*/i;
    let shapeSizeMatch = components[index].match(shapeSizePattern);
    if (shapeSizeMatch) {
      shape = shapeSizeMatch[1] || null;
      size = shapeSizeMatch[2] || null;
      if (shapeSizeMatch[1] || shapeSizeMatch[2]) {
        index++;
      }
    }

    // Check for position (e.g., "at center", "at top left", etc.)
    const positionPattern = /^\s*at\s+([^\s,]+)\s+([^\s,]+)\s*/i;
    let positionMatch = components[index].match(positionPattern);
    if (positionMatch) {
      position = `${positionMatch[1]} ${positionMatch[2]}`;
      index++;
    }

    // Extract color stops
    const colorStops = parseColorStops(components.slice(index));

    const result: ParsedColorRdialGradient = {
      type: 'radial-gradient',
      shape: shape,
      size: size,
      position: position,
      colorStops: colorStops
    };

    return result;
  }

  if (value.startsWith('conic-gradient')) {
    // Regular expression to match the radial-gradient function
    const regex = /conic-gradient\((.*)\)/i;
    const matches = value.match(regex);
    const components = matches[1].split(/,(.+)/);
    const angle = components[0].trim();
    const colorStops = parseColorStops(components[1]);

    const result: ParsedColorConicGradient = {
      type: 'conic-gradient',
      angle: angle,
      colorStops: colorStops
    };

    return result;
  }

  // handle url
  if (value.startsWith('url')) {
    const result: ParsedColorURL = {
      type: 'url',
      ref: value
    };
    return result;
  }

  // handle named colors
  const foundColor = namedColors[value.toLowerCase()];
  if (foundColor) {
    const result: ParsedColorRGBA = {
      type: 'rgba',
      rgba: foundColor
    };
    return result;
  } else {
    const result: ParsedColorRGBA = {
      type: 'rgba',
      rgba: [0, 0, 0, 0]
    };
    return result;
  }
}

export function parsedColorToString(parsedColor: ParsedColor): string {
  switch (parsedColor.type) {
    case 'rgba':
      const [r, g, b, a] = parsedColor.rgba;
      return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
    case 'variable':
      return parsedColor.ref;
    case 'linear-gradient':
      const linearStops = parsedColor.colorStops.map((stop) => `${parsedColorToString(stop.color)} ${stop.position}`).join(', ');
      return `linear-gradient(${parsedColor.direction}, ${linearStops})`;
    case 'radial-gradient':
      const radialStops = parsedColor.colorStops.map((stop) => `${parsedColorToString(stop.color)} ${stop.position}`).join(', ');
      return `radial-gradient(${parsedColor.shape} ${parsedColor.size} at ${parsedColor.position}, ${radialStops})`;
    case 'conic-gradient':
      const conicStops = parsedColor.colorStops.map((stop) => `${parsedColorToString(stop.color)} ${stop.position}`).join(', ');
      return `conic-gradient(${parsedColor.angle}, ${conicStops})`;
    case 'url':
      return parsedColor.ref;
    default:
      throw new Error(`Unknown color type: ${(parsedColor as any).type}`);
  }
}
