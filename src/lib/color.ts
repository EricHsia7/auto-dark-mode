import { clamp } from './clamp';
import { isFunctionalKeyword } from './is-functional-keyword';
import { namedColors } from './named-colors';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';
import { computeStats, getPerChannelDifference, mergeStats } from './stats';
import { systemColors } from './system-colors';

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
  args: Array<Color>;
}

export interface VariableName {
  type: 'variable-n';
  name: string;
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

export interface FunctionalKeyword {
  type: 'keyword';
  value: 'currentcolor' | 'inherit' | 'initial' | 'revert' | 'unset' | 'none';
  // "transparent" is converted to rgba
  // "none" my not mean "transparent," so keep it as-is
}

export interface UnknownString {
  type: 'unknown';
  value: string;
}

export type Color = ColorRGB | ColorRGB_Variable | ColorRGBA | ColorRGBA_Variable | ColorHSL_Variable | ColorHSLA_Variable | Variable | VariableName | LinearGradient | RdialGradient | ConicGradient | _URL | FunctionalKeyword | UnknownString;

function parseColorStops(components: Array<string>): ColorStopArray {
  const colorStops: ColorStopArray = [];
  for (const component of components) {
    const args = splitByTopLevelDelimiter(component).result;
    const argsLen = args.length;
    if (argsLen === 1) {
      const color = parseColor(args[0].trim()) as ColorStop['color'];
      colorStops.push({
        type: 'stop',
        color: color,
        position: ''
      });
    } else if (argsLen === 2) {
      const color = parseColor(args[0].trim()) as ColorStop['color'];
      const position = args[1].trim();
      colorStops.push({
        type: 'stop',
        color: color,
        position: position
      });
    } else if (argsLen > 2) {
      const color = parseColor(args[0].trim()) as ColorStop['color'];
      const position = args
        .slice(1)
        .map((e) => e.trim())
        .join(' ');
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

  // handle variable
  if (value.startsWith('var(')) {
    const trimmed = value.trim();
    const variableRegex = /^var\((.*)\)$/i;
    const variableMatches = trimmed.match(variableRegex);
    if (variableMatches) {
      const args: Array<any> = splitByTopLevelDelimiter(variableMatches[1]).result;
      for (let i = args.length - 1; i >= 0; i--) {
        const arg = args[i];
        if (arg !== '') {
          args.splice(i, 1, parseColor(arg));
        } else {
          args.splice(i, 1);
        }
      }
      const result: Variable = {
        type: 'variable',
        ref: value,
        args: args
      };
      return result;
    }
  }

  // handle variable name
  if (value.startsWith('--')) {
    const variableName = value.trim();
    const result: VariableName = {
      type: 'variable-n',
      name: variableName
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
            const variable = parseColor(parameter) as Variable;
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
      if (value.startsWith('rgba') || parameters[3] !== undefined) {
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
    const regex = /hsla?\((([\.\d]+%|[\.\d]+|var\([^)]*\))[\s\,]*){0,1}(([\.\d]+%|[\.\d]+|var\([^)]*\))[\s\,]*){0,1}(([\.\d]+%|[\.\d]+|var\([^)]*\))[\s\,]*){0,1}(([\.\d]+%|[\.\d]+|var\([^)]*\))[\s\,]*){0,1}\)/gi;
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
            const variable = parseColor(parameter) as Variable;
            parameters.push(variable);
          } else if (/^\d+$/.test(parameter)) {
            const integer: number = parseInt(parameter, 10);
            parameters.push(integer);
          } else if (/^[\d\.]+$/.test(parameter)) {
            const float: number = parseFloat(parameter);
            parameters.push(float);
          } else if (/^\d+%$/.test(parameter)) {
            const number = parseInt(parameter, 10);
            const unit = '%';
            const numberWithUnit: UnitedNumber = {
              type: 'number-u',
              number: number,
              unit: unit
            };
            parameters.push(numberWithUnit);
          } else if (/^[\d\.]+%$/.test(parameter)) {
            const number = parseFloat(parameter);
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

      if (typeof alpha === 'number' && alpha === 1) {
        const result: ColorRGB = {
          type: 'rgb',
          rgb: [red, green, blue]
        };
        return result;
      } else if (typeof alpha === 'number' && alpha !== 1) {
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
    if (components[0].trim().match(/^[\+\-\d]+deg$|^to /)) {
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
  if (value.toLowerCase() === 'transparent') {
    const result: ColorRGBA = {
      type: 'rgba',
      rgba: [0, 0, 0, 0]
    };
    return result;
  }

  // handle functional keywords
  if (isFunctionalKeyword(value)) {
    const result: FunctionalKeyword = {
      type: 'keyword',
      value: value as FunctionalKeyword['value']
    };
    return result;
  }

  // handle named colors
  const foundNamedColor = namedColors[value.toLowerCase()];
  if (foundNamedColor) {
    const result: ColorRGB = {
      type: 'rgb',
      rgb: foundNamedColor
    };
    return result;
  }

  // handle system colors
  const foundSystemColor = systemColors[value.toLowerCase()];
  if (foundSystemColor) {
    const result: ColorRGB = {
      type: 'rgb',
      rgb: foundSystemColor
    };
    return result;
  }

  const unknownString: UnknownString = {
    type: 'unknown',
    value: value
  };

  return unknownString;
}

function invertStops(colorStops: ColorStopArray, lowerBrightness: boolean = false): ColorStopArray {
  const colorStopsLength = colorStops.length;
  const invertedStops: ColorStopArray = [];
  for (let i = colorStopsLength - 1; i >= 0; i--) {
    const stop = colorStops[i];
    if (stop.type === 'stop') {
      const invertedColor = invertColor(stop.color, lowerBrightness) as ColorStop['color'];
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

export function invertColor(color: Color, lowerBrightness: boolean = false): Color {
  switch (color.type) {
    case 'rgb': {
      if (isColorVibrant(color) > 0) {
        return color;
      }

      const [r, g, b] = color.rgb;

      if (r === 0 && g === 0 && b === 0) {
        const result0: ColorRGB = {
          type: 'rgb',
          rgb: [255, 255, 255]
        };
        return result0;
      }

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);

      const minimumValue = 4 / 85;
      const saturation = (max - min) / max;

      const equalizerBase = Math.sqrt(saturation);
      const equalizer = -0.1 + equalizerBase * 1.1;

      const average = (r + g + b) / 3;
      const R = r * (1 - equalizer) + average * equalizer;
      const G = g * (1 - equalizer) + average * equalizer;
      const B = b * (1 - equalizer) + average * equalizer;

      const equalizedValue = Math.max(R, G, B) / 255;
      const newValue = minimumValue + (1 - minimumValue) * (1 - equalizedValue);
      if (lowerBrightness && newValue > equalizedValue) return color;
      const scaler = newValue / equalizedValue;

      const red = clamp(0, Math.round(R * scaler), 255);
      const green = clamp(0, Math.round(G * scaler), 255);
      const blue = clamp(0, Math.round(B * scaler), 255);

      const result: ColorRGB = {
        type: 'rgb',
        rgb: [red, green, blue]
      };

      // color = (r,g,b) where 0 <= r, g, b <= 1
      // scaler = t where 0 < t <= 1
      // newColor = color' = t * color = (tr,tg,tb)

      // value:      v = max(r,g,b)
      //             v' = max(tr,tg,tb) = tv
      // chroma:     c = v - min(r,g,b) = max(r,g,b) - min(r,g,b)
      //             c' = v' - min(tr,tg,tb) = max(tr,tg,tb) - min(tr,tg,tb) = t (max(r,g,b) - min(r,g,b)) = tc
      // saturation: s = 0 [if v = 0], c / v [otherwise]
      //             s' = c' / v' = 0 [if tv = 0], tc / tv [otherwise]
      // hue:        h = 60 * (g - b) / c [if v = r], 60 * (2 + (b - r) / c) [if v = g], 60 * (4 + (r - g) / c) [if v = b]
      //             h' = 60 * (tg - tb) / tc [if tv = tr], 60 * (2 + (tb - tr) / tc) [if tv = tg], 60 * (4 + (tr - tg) / tc) [if tv = tb]
      // h' = h and s' = s and v' = tv
      return result;
      break;
    }

    case 'rgb-v': {
      return color;
      break;
    }

    case 'rgba': {
      const [R, G, B, A] = color.rgba;
      const RGB: ColorRGB = {
        type: 'rgb',
        rgb: [R, G, B]
      };
      const invertedRGB = invertColor(RGB, lowerBrightness) as ColorRGB;
      const [r, g, b] = invertedRGB.rgb;
      const result: ColorRGBA = {
        type: 'rgba',
        rgba: [r, g, b, A]
      };
      return result;
      break;
    }

    case 'rgba-v': {
      const [R, G, B, A] = color.parameters;
      if (typeof R === 'number' && typeof G === 'number' && typeof B === 'number') {
        const RGB: ColorRGB = {
          type: 'rgb',
          rgb: [R, G, B]
        };
        const invertedRGB = invertColor(RGB, lowerBrightness) as ColorRGB;
        const [r, g, b] = invertedRGB.rgb;
        const result: ColorRGBA_Variable = {
          type: 'rgba-v',
          parameters: [r, g, b, A]
        };
        return result;
      } else {
        return color;
      }
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
      for (let i = color.args.length - 1; i >= 0; i--) {
        color.args.splice(i, 1, invertColor(color.args[i], lowerBrightness));
      }
      return color;
      break;
    }

    case 'variable-n': {
      return color; // Variable references are not inverted
      break;
    }

    case 'linear-gradient': {
      const invertedColors = invertStops(color.colorStops, lowerBrightness);
      const result: LinearGradient = {
        type: 'linear-gradient',
        direction: color.direction,
        colorStops: invertedColors
      };
      return result;
      break;
    }

    case 'radial-gradient': {
      const invertedColors = invertStops(color.colorStops, lowerBrightness);
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
      const invertedColors = invertStops(color.colorStops, lowerBrightness);
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

    case 'keyword': {
      return color;
      break;
    }

    case 'unknown': {
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
      const arr: Array<any> = color.args;
      for (let i = arr.length - 1; i >= 0; i--) {
        arr.splice(i, 1, colorToString(arr[i]));
      }
      return `var(${arr.flat(8).join(',')})`;
    }

    case 'variable-n': {
      return color.name;
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

    case 'keyword': {
      return color.value;
    }

    case 'unknown': {
      return color.value;
    }

    default: {
      return '';
      break;
    }
  }
}

export function isColorDark(color: ColorRGBA): number {
  const p = -0.002315205943 * color.rgba[0] + 0.724916473719 + -0.00518915994 * color.rgba[1] + 1.093306292424 - 0.001444153598 * color.rgba[2] + 0.627977492263;
  const q = clamp(0, p * color.rgba[3], 1);
  // ./data/darkness.csv
  return q;
  // higher number means higher probability
}

const baseColors: number[][] = [
  [255, 255, 255],
  [192, 192, 192],
  [128, 128, 128],
  [64, 64, 64],
  [0, 0, 0],
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255]
];

const baseStats = computeStats(baseColors); // Precompute once

export function isColorVibrant(color: ColorRGB): number {
  // const p = 0.006339594673 * Math.abs(color.rgb[0] - color.rgb[1]) + 0.1357803475 + 0.006733518277 * Math.abs(color.rgb[1] - color.rgb[2]) + 0.1787805054 + 0.005240646414 * Math.abs(color.rgb[0] - color.rgb[2]) + 0.1162090602;
  // const p = 0.006669426162 * Math.abs(color.rgb[0] - color.rgb[1]) + 0.07742765348 + 0.007073453738 * Math.abs(color.rgb[1] - color.rgb[2]) + 0.1163189972 + 0.005399325815 * Math.abs(color.rgb[0] - color.rgb[2]) + 0.06675079166;
  // const p = 0.006694646769 * Math.abs(color.rgb[0] - color.rgb[1]) + 0.06369476726 + 0.007040201321 * Math.abs(color.rgb[1] - color.rgb[2]) + 0.1045286998 + 0.005413701273 * Math.abs(color.rgb[0] - color.rgb[2]) + 0.05323332153;
  // const q = Math.min(Math.max(p / 3, 0), 1);
  // return q;
  // ./data/vibrancy.csv

  const [r, g, b] = color.rgb;
  const [prg, pgb, pbr] = getPerChannelDifference(r, g, b);

  const [RG_avg, RG_stdev] = mergeStats(baseStats.avg[0], baseStats.stdev[0], baseStats.n, prg, 0, 1);
  const [GB_avg, GB_stdev] = mergeStats(baseStats.avg[1], baseStats.stdev[1], baseStats.n, pgb, 0, 1);
  const [BR_avg, BR_stdev] = mergeStats(baseStats.avg[2], baseStats.stdev[2], baseStats.n, pbr, 0, 1);

  const d = (prg - RG_avg) / RG_stdev;
  const e = (pgb - GB_avg) / GB_stdev;
  const f = (pbr - BR_avg) / BR_stdev;

  return (d + e + f) / 3;
}
