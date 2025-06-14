import { namedColors } from './named-colors';

export interface ColorRGB {
  type: 'rgb';
  rgb: [red: number, green: number, blue: number];
}

export type ColorRGBParameter = Variable | number;

export type ColorRGBParameterArray = Array<ColorRGBParameter>;

export interface ColorRGB_Variable {
  type: 'rgb-v';
  parameters: ColorRGBParameterArray;
}

export interface ColorRGBA {
  type: 'rgba';
  rgba: [red: number, green: number, blue: number, alpha: number];
}

export interface ColorRGBA_Variable {
  type: 'rgba-v';
  parameters: ColorRGBParameterArray;
}

export type ColorHSLParameter = Variable | number | UnitedNumber;

export type ColorHSLParameterArray = Array<ColorHSLParameter>;

export interface ColorHSL_Variable {
  type: 'hsl-v';
  parameters: ColorHSLParameterArray;
}

export interface ColorHSLA_Variable {
  type: 'hsla-v';
  parameters: ColorHSLParameterArray;
}

export interface Variable {
  type: 'variable';
  ref: string; // var(--name)
}

export interface UnitedNumber {
  type: 'number-u';
  number: number;
  unit: string;
}

export interface ColorStop {
  type: 'stop';
  color: ColorRGB | ColorRGB_Variable | ColorRGBA | ColorRGBA_Variable | ColorHSL_Variable | ColorHSLA_Variable | Variable;
  position: string;
}

export type ColorStopArray = Array<ColorStop>;

export interface LinearGradient {
  type: 'linear-gradient';
  direction: string;
  colorStops: ColorStopArray;
}

export interface RdialGradient {
  type: 'radial-gradient';
  shape: string;
  size: string;
  position: string;
  colorStops: ColorStopArray;
}

export interface ConicGradient {
  type: 'conic-gradient';
  angle: string;
  colorStops: ColorStopArray;
}

export interface _URL {
  type: 'url';
  ref: string; // url(https://example.com/example.png)
}

export interface CurrentColor {
  type: 'currentColor';
}

export type Color = ColorRGB | ColorRGB_Variable | ColorRGBA | ColorRGBA_Variable | ColorHSL_Variable | ColorHSLA_Variable | Variable | LinearGradient | RdialGradient | ConicGradient | _URL | CurrentColor;

function parseColorStops(components: Array<string>): ColorStopArray {
  const positionRegex = /(\d+(cm|mm|in|px|pt|pc|rem|ex|ch|em|vw|vh|vmin|vmax|%))$/;
  const colorStops: ColorStopArray = [];
  for (const component of components) {
    const trimmedComponent = component.trim();
    const matches = trimmedComponent.match(positionRegex);
    if (matches) {
      const color = parseColor(trimmedComponent.replace(positionRegex, '').trim()) as ColorStop['color'];
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

export function parseColor(value: string): Color {
  const fallbackColor: ColorRGBA = {
    type: 'rgba',
    rgba: [255, 255, 255, 0]
  };

  if (value.startsWith('var(')) {
    const result: Variable = {
      type: 'variable',
      ref: value
    };
    return result;
  }

  // handle rgb/rgba
  if (value.startsWith('rgb')) {
    const regex = /rgba?\((([\d\.]+|var\([^)]*\))[\s\,\/]*){0,1}(([\d\.]+|var\([^)]*\))[\s\,\/]*){0,1}(([\d\.]+|var\([^)]*\))[\s\,\/]*){0,1}(([\d\.]+|var\([^)]*\))[\s\,\/]*){0,1}\)/gi;
    const parameters: ColorRGBParameterArray = [];
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
            const variable: Variable = {
              type: 'variable',
              ref: parameter
            };
            parameters.push(variable);
          } else if (/^\d+$/.test(parameter)) {
            const integer: number = parseInt(parameter, 10);
            parameters.push(integer);
          } else if (/^[\d\.]+$/.test(parameter)) {
            const float: number = parseFloat(parameter);
            parameters.push(float);
          }
        }
      });
    }

    if (containVariables) {
      if (value.startsWith('rgba')) {
        const result: ColorRGBA_Variable = {
          type: 'rgba-v',
          parameters: parameters
        };
        return result;
      } else {
        const result: ColorRGB_Variable = {
          type: 'rgb-v',
          parameters: parameters
        };
        return result;
      }
    } else {
      if (typeof parameters[3] === 'number' && parameters[3] !== 1) {
        const result: ColorRGBA = {
          type: 'rgba',
          rgba: [parameters[0] as number, parameters[1] as number, parameters[2] as number, parameters[3] as number]
        };
        return result;
      } else {
        const result: ColorRGB = {
          type: 'rgb',
          rgb: [parameters[0] as number, parameters[1] as number, parameters[2] as number]
        };
        return result;
      }
    }
  }

  // handle hsl
  if (value.startsWith('hsl')) {
    const regex = /hsla?\(((\d+%?|var\([^)]*\))[\s\,]*){0,1}((\d+%?|var\([^)]*\))[\s\,]*){0,1}((\d+%?|var\([^)]*\))[\s\,]*){0,1}((\d+%?|var\([^)]*\))[\s\,]*){0,1}\)/gi;
    const parameters: ColorHSLParameterArray = [];
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
            const variable: Variable = {
              type: 'variable',
              ref: parameter
            };
            parameters.push(variable);
          } else if (/^\d+$/.test(parameter)) {
            const integer: number = parseInt(parameter, 10);
            parameters.push(integer);
          } else if (/^\d+%$/.test(parameter)) {
            const number = parseInt(parameter);
            const unit = '%';
            const numberWithUnit: UnitedNumber = {
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
        const result: ColorHSLA_Variable = {
          type: 'hsla-v',
          parameters: parameters
        };
        return result;
      } else {
        const result: ColorHSL_Variable = {
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

      const i = hue / 60;
      const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
      const x = chroma * (1 - Math.abs((i % 2) - 1));
      const m = lightness - chroma / 2;

      const pattern = [
        [chroma, x, 0],
        [x, chroma, 0],
        [0, chroma, x],
        [0, x, chroma],
        [x, 0, chroma],
        [chroma, 0, x]
      ][Math.floor(i) % 6];

      const [r1, g1, b1] = pattern;

      // Convert to 0–255 and return
      const red = Math.round((r1 + m) * 255);
      const green = Math.round((g1 + m) * 255);
      const blue = Math.round((b1 + m) * 255);
      // Handle alpha
      const alpha = (parameters[3] !== undefined ? parameters[3] : 1) as number;

      if (alpha === 1) {
        const result: ColorRGB = {
          type: 'rgb',
          rgb: [red, green, blue]
        };
        return result;
      } else {
        const result: ColorRGBA = {
          type: 'rgba',
          rgba: [red, green, blue, alpha]
        };
        return result;
      }
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

    if (alpha === 1) {
      const result: ColorRGB = {
        type: 'rgb',
        rgb: [red, green, blue]
      };
      return result;
    } else {
      const result: ColorRGBA = {
        type: 'rgba',
        rgba: [red, green, blue, alpha]
      };
      return result;
    }
  }

  // handle linear gradient
  if (value.startsWith('linear-gradient') || value.startsWith('-webkit-linear-gradient')) {
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
    let direction = '';
    if (components[0].trim().match(/^\d+deg$|^to /)) {
      direction = components.shift().trim();
    } else {
      direction = 'to bottom'; // default direction if not specified
    }

    // Process remaining parts as color stops
    const colorStops = parseColorStops(components);

    const result: LinearGradient = {
      type: 'linear-gradient',
      direction: direction,
      colorStops: colorStops
    };

    return result;
  }

  // handle radial gradient
  if (value.startsWith('radial-gradient') || value.startsWith('-webkit-radial-gradient')) {
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
      shape = shapeSizeMatch[1] || '';
      size = shapeSizeMatch[2] || '';
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

    const result: RdialGradient = {
      type: 'radial-gradient',
      shape: shape,
      size: size,
      position: position,
      colorStops: colorStops
    };

    return result;
  }

  if (value.startsWith('conic-gradient') || value.startsWith('-webkit-conic-gradient')) {
    // Regular expression to match the radial-gradient function
    const regex = /conic-gradient\((.*)\)/i;
    const matches = value.match(regex);
    if (matches) {
      const components = matches[1].split(/,(.+)/);
      const angle = components[0].trim();
      const colorStops = parseColorStops([components[1]]);

      const result: ConicGradient = {
        type: 'conic-gradient',
        angle: angle,
        colorStops: colorStops
      };
      return result;
    }
  }

  // handle url
  if (value.startsWith('url')) {
    const result: _URL = {
      type: 'url',
      ref: value
    };
    return result;
  }

  // handle transparent
  if (value.toLocaleLowerCase() === 'transparent') {
    const result: ColorRGBA = {
      type: 'rgba',
      rgba: [255, 255, 255, 0]
    };
    return result;
  }

  // handle currentColor
  if (value === 'currentColor') {
    const result: CurrentColor = {
      type: 'currentColor'
    };
    return result;
  }

  // handle named colors
  const foundColor = namedColors[value.toLowerCase()];
  if (foundColor) {
    const result: ColorRGB = {
      type: 'rgb',
      rgb: foundColor
    };
    return result;
  }

  return fallbackColor;
}

function invertStops(colorStops: ColorStopArray): ColorStopArray {
  const colorStopsLength = colorStops.length;
  const invertedStops: ColorStopArray = [];
  for (let i = colorStopsLength - 1; i >= 0; i--) {
    const stop = colorStops[i];
    if (stop.type === 'stop') {
      const invertedColor = invertColor(stop.color) as ColorStop['color'];
      const invertedColorStop: ColorStop = {
        type: 'stop',
        color: invertedColor,
        position: stop.position
      };
      invertedStops.unshift(invertedColorStop);
    }
  }
  return invertedStops;
}

export function invertColor(color: Color): Color {
  switch (color.type) {
    case 'rgb': {
      const [R, G, B] = color.rgb;

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

      if (isColorVibrant(color) > 0.31) {
        return color;
      }

      const newHue = originalHue;
      const newSaturation = originalSaturation;
      const newValue = 0.05 + (1 - 0.05) * (1 - originalValue);

      const i = Math.floor(newHue * 6);
      const f = newHue * 6 - i;
      const p = newValue * (1 - newSaturation);
      const q = newValue * (1 - f * newSaturation);
      const t = newValue * (1 - (1 - f) * newSaturation);

      const [r1, g1, b1] = [
        [newValue, t, p],
        [q, newValue, p],
        [p, newValue, t],
        [p, q, newValue],
        [t, p, newValue],
        [newValue, p, q]
      ][i % 6];

      const red = Math.round(r1 * 255);
      const green = Math.round(g1 * 255);
      const blue = Math.round(b1 * 255);

      const result: ColorRGB = {
        type: 'rgb',
        rgb: [red, green, blue]
      };

      return result;
      break;
    }

    case 'rgb-v': {
      return color; // Color with referenced variables are not inverted
      break;
    }

    case 'rgba': {
      const [R, G, B, A] = color.rgba;
      const RGB: ColorRGB = {
        type: 'rgb',
        rgb: [R, G, B]
      };
      const invertedRGB = invertColor(RGB) as ColorRGB;
      const [r, g, b] = invertedRGB.rgb;
      const result: ColorRGBA = {
        type: 'rgba',
        rgba: [r, g, b, A]
      };
      return result;
      break;
    }

    case 'rgba-v': {
      return color; // Color with referenced variables are not inverted
      break;
    }

    case 'hsl-v': {
      return color;
      break;
    }

    case 'hsla-v': {
      return color;
      break;
    }

    case 'variable': {
      return color; // Referenced variables are not inverted
      break;
    }

    case 'linear-gradient': {
      const invertedColors = invertStops(color.colorStops);
      const result: LinearGradient = {
        type: 'linear-gradient',
        direction: color.direction,
        colorStops: invertedColors
      };
      return result;
      break;
    }

    case 'radial-gradient': {
      const invertedColors = invertStops(color.colorStops);
      const result: RdialGradient = {
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
      const result: ConicGradient = {
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

    case 'currentColor': {
      return color;
      break;
    }

    default: {
      return color; // Fallback for any other types
      break;
    }
  }
}

export function colorToString(color: Color): string {
  switch (color.type) {
    case 'rgb': {
      const [r, g, b] = color.rgb;
      return `rgb(${r},${g},${b})`;
    }

    case 'rgb-v': {
      const components = [];
      for (const parameter of color.parameters) {
        components.push(typeof parameter === 'number' ? parameter : parameter.ref);
      }
      return `rgb(${components.join(',')})`;
    }

    case 'rgba': {
      const [r, g, b, a] = color.rgba;
      return `rgba(${r},${g},${b},${a})`;
    }

    case 'rgba-v': {
      const components = [];
      for (const parameter of color.parameters) {
        components.push(typeof parameter === 'number' ? parameter : parameter.ref);
      }
      return `rgba(${components.join(',')})`;
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

    case 'variable': {
      return color.ref;
    }

    case 'linear-gradient': {
      const linearStops = color.colorStops.map((stop) => `${colorToString(stop.color)} ${stop.position}`).join(',');
      return `linear-gradient(${color.direction},${linearStops})`;
    }

    case 'radial-gradient': {
      const radialStops = color.colorStops.map((stop) => `${colorToString(stop.color)} ${stop.position}`).join(',');
      return `radial-gradient(${color.shape} ${color.size} at ${color.position},${radialStops})`;
    }

    case 'conic-gradient': {
      const conicStops = color.colorStops.map((stop) => `${colorToString(stop.color)} ${stop.position}`).join(', ');
      return `conic-gradient(${color.angle},${conicStops})`;
    }

    case 'url': {
      return color.ref;
    }

    case 'currentColor': {
      return 'currentColor';
    }

    default: {
      return '';
      break;
    }
  }
}

export function isColorDark(color: ColorRGBA): number {
  const p = -0.002315205943 * color.rgba[0] + 0.724916473719 + -0.00518915994 * color.rgba[1] + 1.093306292424 - 0.001444153598 * color.rgba[2] + 0.627977492263;
  const q = Math.min(Math.max(p * color.rgba[3], 0), 1);
  // ./data/darkness.csv
  return q;
  // higher number means higher probability
}

export function isColorVibrant(color: ColorRGB): number {
  // const p = 0.00526701208730907 * Math.abs(color.rgb[0] - color.rgb[1]) + 0.2315923467761 + 0.005789762029929 * Math.abs(color.rgb[1] - color.rgb[2]) + 0.268849448143961 + 0.00445659947538687 * Math.abs(color.rgb[0] - color.rgb[2]) + 0.20534779494441;
  const p = 0.006339594673 * Math.abs(color.rgb[0] - color.rgb[1]) + 0.1357803475 + 0.006733518277 * Math.abs(color.rgb[1] - color.rgb[2]) + 0.1787805054 + 0.005240646414 * Math.abs(color.rgb[0] - color.rgb[2]) + 0.1162090602;
  const q = Math.min(Math.max(p / 3, 0), 1);
  // ./data/vibrancy.csv
  return q;
  // higher number means higher probability
}
