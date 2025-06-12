import { namedColors } from './named-colors';

export interface ParsedColorRGBA {
  type: 'rgba';
  rgba: [red: number, green: number, blue: number, alpha: number];
}

export interface ParsedColorRGBWithVariable {
  type: 'rgb-v';
  parameters: Array<ParsedColorVariable | number>;
}

export interface ParsedColorRGBAWithVariable {
  type: 'rgba-v';
  parameters: Array<ParsedColorVariable | number>;
}

export interface ParsedColorHSLWithVariable {
  type: 'hsl-v';
  parameters: Array<ParsedColorVariable | number | ParsedColorNumberWithUnit>;
}

export interface ParsedColorHSLAWithVariable {
  type: 'hsla-v';
  parameters: Array<ParsedColorVariable | number | ParsedColorNumberWithUnit>;
}

export interface ParsedColorVariable {
  type: 'variable';
  ref: string; // var(--name)
}

export interface ParsedColorNumberWithUnit {
  type: 'number-u';
  number: number;
  unit: string;
}

export interface ParsedColorStop {
  type: 'stop';
  color: ParsedColorRGBA | ParsedColorRGBAWithVariable | ParsedColorRGBWithVariable | ParsedColorVariable;
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

export type ParsedColor = ParsedColorRGBA | ParsedColorRGBAWithVariable | ParsedColorRGBWithVariable | ParsedColorHSLAWithVariable | ParsedColorHSLWithVariable | ParsedColorVariable | ParsedColorLinearGradient | ParsedColorRdialGradient | ParsedColorConicGradient | ParsedColorURL;

export function parseColor(value: string): ParsedColor {
  function parseColorStops(components: Array<string>): ParsedColorStopArray {
    const positionRegex = /(\d+(cm|mm|in|px|pt|pc|rem|ex|ch|em|vw|vh|vmin|vmax|%))$/;
    const colorStops: ParsedColorStopArray = [];
    for (const component of components) {
      const trimmedComponent = component.trim();
      const matches = trimmedComponent.match(positionRegex);
      if (matches) {
        const color = parseColor(trimmedComponent.replace(positionRegex, '').trim()) as ParsedColorRGBA | ParsedColorRGBAWithVariable | ParsedColorRGBWithVariable | ParsedColorVariable;
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

  const fallbackColor: ParsedColorRGBA = {
    type: 'rgba',
    rgba: [255, 255, 255, 0]
  };

  if (value.startsWith('var(')) {
    const result: ParsedColorVariable = {
      type: 'variable',
      ref: value
    };
    return result;
  }

  // handle rgb/rgba
  if (value.startsWith('rgb')) {
    const regex = /rgba?\(((\d+|var\([^)]*\)|[\d\.]+)[\s\,]*){0,1}((\d+|var\([^)]*\)|[\d\.]+)[\s\,]*){0,1}((\d+|var\([^)]*\)|[\d\.]+)[\s\,]*){0,1}((\d+|var\([^)]*\)|[\d\.]+)[\s\,]*){0,1}\)/gi;
    const parameters: Array<ParsedColorVariable | number> = [];
    let containVariables = false;
    let matches;
    while ((matches = regex.exec(value)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (matches.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      matches.forEach((match, groupIndex) => {
        if (groupIndex > 0 && groupIndex % 2 === 0 && match) {
          const parameter = match.trim();
          if (parameter.startsWith('var')) {
            containVariables = true;
            const parsedColorVariable: ParsedColorVariable = {
              type: 'variable',
              ref: parameter
            };
            parameters.push(parsedColorVariable);
          } else if (/^\d+$/.test(parameter)) {
            const integer: number = parseInt(parameter, 10);
            parameters.push(integer);
          } else if (/^\d+\.?\d+$/.test(parameter)) {
            const float: number = parseFloat(parameter);
            parameters.push(float);
          }
        }
      });
    }

    if (containVariables) {
      if (value.startsWith('rgba')) {
        const result: ParsedColorRGBAWithVariable = {
          type: 'rgba-v',
          parameters: parameters
        };
        return result;
      } else {
        const result: ParsedColorRGBWithVariable = {
          type: 'rgb-v',
          parameters: parameters
        };
        return result;
      }
    } else {
      const result: ParsedColorRGBA = {
        type: 'rgba',
        rgba: [parameters[0] as number, parameters[1] as number, parameters[2] as number, (parameters[3] !== undefined ? parameters[3] : 1) as number]
      };
      return result;
    }
  }

  // handle hsl
  if (value.startsWith('hsl')) {
    const regex = /hsla?\(((\d+%?|var\([^)]*\))[\s\,]*){0,1}((\d+%?|var\([^)]*\))[\s\,]*){0,1}((\d+%?|var\([^)]*\))[\s\,]*){0,1}((\d+%?|var\([^)]*\))[\s\,]*){0,1}\)/gi;
    const parameters: Array<ParsedColorVariable | number | ParsedColorNumberWithUnit> = [];
    let containVariables = false;
    let matches;
    while ((matches = regex.exec(value)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (matches.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      matches.forEach((match, groupIndex) => {
        if (groupIndex > 0 && groupIndex % 2 === 0 && match) {
          const parameter = match.trim();
          if (parameter.startsWith('var')) {
            containVariables = true;
            const parsedColorVariable: ParsedColorVariable = {
              type: 'variable',
              ref: parameter
            };
            parameters.push(parsedColorVariable);
          } else if (/^\d+$/.test(parameter)) {
            const integer: number = parseInt(parameter, 10);
            parameters.push(integer);
          } else if (/^\d+%$/.test(parameter)) {
            const number = parseInt(parameter);
            const unit = '%';
            const numberWithUnit: ParsedColorNumberWithUnit = {
              type: 'number-u',
              number: number,
              unit: unit
            };
            parameters.push(numberWithUnit);
          }
        }
      });
    }

    if (containVariables) {
      if (value.startsWith('hsla')) {
        const result: ParsedColorHSLAWithVariable = {
          type: 'hsla-v',
          parameters: parameters
        };
        return result;
      } else {
        const result: ParsedColorHSLWithVariable = {
          type: 'hsl-v',
          parameters: parameters
        };
        return result;
      }
    } else {
      // Convert from percent to fraction
      let hue = 0;
      let saturation = 0;
      let lightness = 0;

      if (typeof parameters[0] === 'number') {
        hue = parameters[0];
      }
      if (typeof parameters[1] === 'object') {
        if (parameters[1].type === 'number-u') {
          saturation = parameters[1].number / 100;
        }
      }
      if (typeof parameters[2] === 'object') {
        if (parameters[2].type === 'number-u') {
          lightness = parameters[2].number / 100;
        }
      }

      const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
      const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
      const m = lightness - chroma / 2;

      let r1 = 0,
        g1 = 0,
        b1 = 0;

      if (hue >= 0 && hue < 60) {
        r1 = chroma;
        g1 = x;
        b1 = 0;
      } else if (hue >= 60 && hue < 120) {
        r1 = x;
        g1 = chroma;
        b1 = 0;
      } else if (hue >= 120 && hue < 180) {
        r1 = 0;
        g1 = chroma;
        b1 = x;
      } else if (hue >= 180 && hue < 240) {
        r1 = 0;
        g1 = x;
        b1 = chroma;
      } else if (hue >= 240 && hue < 300) {
        r1 = x;
        g1 = 0;
        b1 = chroma;
      } else if (hue >= 300 && hue < 360) {
        r1 = chroma;
        g1 = 0;
        b1 = x;
      }

      // Convert to 0–255 and return
      const r = Math.round((r1 + m) * 255);
      const g = Math.round((g1 + m) * 255);
      const b = Math.round((b1 + m) * 255);

      const result: ParsedColorRGBA = {
        type: 'rgba',
        rgba: [r, g, b, (parameters[3] !== undefined ? parameters[3] : 1) as number]
      };
      return result;
    }
  }

  // handle hex color
  if (value.startsWith('#')) {
    const colorLength = value.length;
    let red: number = 0;
    let green: number = 0;
    let blue: number = 0;
    let alpha: number = 0;

    switch (colorLength) {
      case 4:
        // #fff
        red = parseInt(value[1] + value[1], 16);
        green = parseInt(value[2] + value[2], 16);
        blue = parseInt(value[3] + value[3], 16);
        alpha = 1;
        break;
      case 7:
        // #ffffff
        red = parseInt(value.slice(1, 3), 16);
        green = parseInt(value.slice(3, 5), 16);
        blue = parseInt(value.slice(5, 7), 16);
        alpha = 1;
        break;
      case 9:
        // #ffffffff
        red = parseInt(value.slice(1, 3), 16);
        green = parseInt(value.slice(3, 5), 16);
        blue = parseInt(value.slice(5, 7), 16);
        alpha = parseInt(value.slice(7, 9), 16) / 255;
        break;
      default:
        break;
    }

    const result: ParsedColorRGBA = {
      type: 'rgba',
      rgba: [red, green, blue, alpha]
    };
    return result;
  }

  // handle linear gradient
  if (value.startsWith('linear-gradient')) {
    // Regular expression to match the linear-gradient function
    const regex = /linear-gradient\((.*)\)/;
    const matches = value.match(regex);

    if (!matches || matches.length < 2) {
      return fallbackColor;
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
      return fallbackColor;
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
    return fallbackColor;
  }
}

export function invertParsedColor(color: ParsedColor): ParsedColor {
  function invertStops(colorStops: ParsedColorStopArray) {
    const colorStopsLength = colorStops.length;
    const invertedStops: ParsedColorStopArray = [];
    for (let i = colorStopsLength - 1; i >= 0; i--) {
      const stop = colorStops[i];
      if (stop.type === 'stop') {
        const invertedColor = invertParsedColor(stop.color) as ParsedColorRGBA | ParsedColorRGBAWithVariable | ParsedColorRGBWithVariable | ParsedColorVariable;
        const invertedColorStop: ParsedColorStop = {
          type: 'stop',
          color: invertedColor,
          position: stop.position
        };
        invertedStops.unshift(invertedColorStop);
      }
    }
    return invertedStops;
  }

  switch (color.type) {
    case 'rgba': {
      const [R, G, B, A] = color.rgba;

      const r = R / 255;
      const g = G / 255;
      const b = B / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;

      let originalHue = 0;
      const originalSaturation = max === 0 ? 0 : delta / max;
      const originalValue = max;

      if (delta !== 0) {
        if (max === r) originalHue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        else if (max === g) originalHue = ((b - r) / delta + 2) / 6;
        else originalHue = ((r - g) / delta + 4) / 6;
      }

      /*
      if (originalSaturation > 0.35 && originalValue > 0.55) {
        return color;
      }
      */

      if (isParsedColorVibrant(color) > 0.4) {
        return color;
      }

      const newHue = originalHue;
      const newSaturation = originalSaturation;
      const newValue = Math.max(1 - originalValue, 0.08);

      const i = Math.floor(newHue * 6);
      const f = newHue * 6 - i;
      const p = newValue * (1 - newSaturation);
      const q = newValue * (1 - f * newSaturation);
      const t = newValue * (1 - (1 - f) * newSaturation);

      const [newRed, newGreen, newBlue] = [
        [newValue, t, p],
        [q, newValue, p],
        [p, newValue, t],
        [p, q, newValue],
        [t, p, newValue],
        [newValue, p, q]
      ][i % 6].map((x) => Math.round(x * 255));

      const result: ParsedColorRGBA = {
        type: 'rgba',
        rgba: [newRed, newGreen, newBlue, A]
      };

      return result;
      break;
    }

    case 'rgba-v': {
      return color; // Color with referenced variables are not inverted
      break;
    }

    case 'rgb-v': {
      return color; // Color with referenced variables are not inverted
      break;
    }

    case 'hsla-v': {
      return color;
      break;
    }

    case 'hsl-v': {
      return color;
      break;
    }

    case 'variable': {
      return color; // Referenced variables are not inverted
      break;
    }

    case 'linear-gradient': {
      const invertedColors = invertStops(color.colorStops);
      const result: ParsedColorLinearGradient = {
        type: 'linear-gradient',
        direction: color.direction,
        colorStops: invertedColors
      };
      return result;
      break;
    }

    case 'radial-gradient': {
      const invertedColors = invertStops(color.colorStops);
      const result: ParsedColorRdialGradient = {
        type: 'radial-gradient',
        position: color.position,
        shape: color.shape,
        size: color.size,
        colorStops: invertedColors
      };
      return result;
      break;
    }

    case 'conic-gradient': {
      const invertedColors = invertStops(color.colorStops);
      const result: ParsedColorConicGradient = {
        type: 'conic-gradient',
        angle: color.angle,
        colorStops: invertedColors
      };
      return result;
      break;
    }

    case 'url': {
      return color;
      break;
    }

    default: {
      return color; // Fallback for any other types
      break;
    }
  }
}

export function parsedColorToString(color: ParsedColor): string {
  switch (color.type) {
    case 'rgba': {
      const [r, g, b, a] = color.rgba;
      return a < 1 ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`;
    }

    case 'rgba-v': {
      const components = [];
      for (const parameter of color.parameters) {
        components.push(typeof parameter === 'number' ? parameter : parameter.ref);
      }
      return `rgba(${components.join(',')})`;
    }

    case 'rgb-v': {
      const components = [];
      for (const parameter of color.parameters) {
        components.push(typeof parameter === 'number' ? parameter : parameter.ref);
      }
      return `rgb(${components.join(',')})`;
    }

    case 'hsla-v': {
      const components = [];
      for (const parameter of color.parameters) {
        if (typeof parameter === 'number') {
          components.push(parameter);
        } else if (typeof parameter === 'object') {
          if (parameter.type === 'number-u') {
            components.push(`${parameter.number.toString()}${parameter.unit}`);
          }
          if (parameter.type === 'variable') {
            components.push(parameter.ref);
          }
        }
      }
      return `hsla(${components.join(',')})`;
    }

    case 'hsl-v': {
      const components = [];
      for (const parameter of color.parameters) {
        if (typeof parameter === 'number') {
          components.push(parameter);
        } else if (typeof parameter === 'object') {
          if (parameter.type === 'number-u') {
            components.push(`${parameter.number.toString()}${parameter.unit}`);
          }
          if (parameter.type === 'variable') {
            components.push(parameter.ref);
          }
        }
      }
      return `hsl(${components.join(',')})`;
    }

    case 'variable': {
      return color.ref;
    }

    case 'linear-gradient': {
      const linearStops = color.colorStops.map((stop) => `${parsedColorToString(stop.color)} ${stop.position}`).join(',');
      return `linear-gradient(${color.direction},${linearStops})`;
    }

    case 'radial-gradient': {
      const radialStops = color.colorStops.map((stop) => `${parsedColorToString(stop.color)} ${stop.position}`).join(',');
      return `radial-gradient(${color.shape} ${color.size} at ${color.position},${radialStops})`;
    }

    case 'conic-gradient': {
      const conicStops = color.colorStops.map((stop) => `${parsedColorToString(stop.color)} ${stop.position}`).join(', ');
      return `conic-gradient(${color.angle},${conicStops})`;
    }

    case 'url': {
      return color.ref;
    }

    default: {
      return '';
      break;
    }
  }
}

export function isParsedColorDark(color: ParsedColorRGBA): number {
  const p = -0.002315205943 * color.rgba[0] + 0.724916473719 + -0.00518915994 * color.rgba[1] + 1.093306292424 - 0.001444153598 * color.rgba[2] + 0.627977492263;
  const q = Math.min(Math.max(p * color.rgba[3], 0), 1);
  return q;
  // higher number means higher probability
}

export function isParsedColorVibrant(color: ParsedColorRGBA): number {
  const p = 0.00526701208730907 * Math.abs(color.rgba[0] - color.rgba[1]) + 0.2315923467761 + 0.005789762029929 * Math.abs(color.rgba[1] - color.rgba[2]) + 0.268849448143961 + 0.00445659947538687 * Math.abs(color.rgba[0] - color.rgba[2]) + 0.20534779494441;
  const q = Math.min(Math.max(p / 3, 0), 1);
  return q;
  // higher number means higher probability
}
