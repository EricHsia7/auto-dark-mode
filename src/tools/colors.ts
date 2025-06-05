import { namedColors } from './named-colors';

export interface ParsedColorRGBA {
  type: 'rgba';
  rgba: [red: number, green: number, blue: number, alpha: number];
}

export interface ParsedColorVariable {
  type: 'variable';
  ref: string; // var(--name)
}

export interface ParsedColorURL {
  type: 'url';
  ref: string; // url(https://example.com/example.png)
}

export interface ParsedColorList {
  type: 'list';
  list: Array<ParsedColorRGBA | ParsedColorVariable>;
}

interface RGBA {
  type: 'color';
  r: number;
  g: number;
  b: number;
  a: number;
}

interface RGB {
  type: 'color';
  r: number;
  g: number;
  b: number;
}

interface HSV {
  type: 'color';
  h: number;
  s: number;
  v: number;
}

interface colorStop {
  type: 'color-stop';
  color: RGBA;
  position: string;
}

interface linearGradient {
  type: 'linear-gradient';
  direction: string;
  colorStops: colorStop[];
}

interface radialGradient {
  type: 'radial-gradient';
  shape: string;
  size: string;
  position: string;
  colorStops: colorStop[];
}

interface conicGradient {
  type: 'conic-gradient';
  angle: string;
  colorStops: colorStop[];
}

export function convertedToRGBA(propertyValue: string): ParsedColorRGBA | ParsedColorVariable | RGBA | linearGradient | radialGradient | conicGradient {
  function parseGradient(gradient: string) {
    const linearGradientRegex = /^linear-gradient\((.*)\)$/;
    const radialGradientRegex = /^radial-gradient\((.*)\)$/;
    const conicGradientRegex = /^conic-gradient\((.*)\)$/;

    function parseColorStops(parts: string[]): colorStop[] {
      const positionRegex = /(\d+(cm|mm|in|px|pt|pc|rem|ex|ch|em|vw|vh|vmin|vmax|%))$/;
      var colorStops: colorStop[] = [];
      parts.forEach((part) => {
        var matches2 = part.trim().match(positionRegex);
        if (matches2) {
          var color = getColorInRGBAFromString(part.trim().replace(positionRegex, '').trim());
          var position = matches2[0].trim();
          colorStops.push({
            type: 'color-stop',
            color,
            position
          });
        }
      });
      return colorStops;
    }

    function parseLinearGradient(gradientString: string): linearGradient {
      // Regular expression to match the linear-gradient function
      const regex = /linear-gradient\((.*)\)/;
      const matches = gradientString.match(regex);

      if (!matches || matches.length < 2) {
        throw new Error('Invalid linear gradient string');
      }

      // Extract the content inside the linear-gradient function
      const gradientContent = matches[1];

      // Split the content by commas, but ignore commas inside parentheses
      const parts = gradientContent.split(/,(?![^\(]*\))/);

      // Determine if the first part is a direction or a color stop
      let direction;
      if (parts[0].trim().match(/^\d+deg$|^to /)) {
        direction = parts.shift().trim();
      } else {
        direction = 'to bottom'; // default direction if not specified
      }

      // Process remaining parts as color stops
      const colorStops = parseColorStops(parts);
      return { type: 'linear-gradient', direction, colorStops };
    }

    function parseRadialGradient(gradientString: string): radialGradient {
      // Give the default values
      const gradient = {
        type: 'radial-gradient',
        shape: 'circle',
        size: 'farthest-corner',
        position: 'center',
        colorStops: []
      };

      // Regular expression to match the radial-gradient function
      const regex = /radial-gradient\((.*)\)/i;
      const matches = gradientString.match(regex);

      if (!matches) {
        throw new Error('Invalid radial gradient string');
      }

      // Split the content by commas, but ignore commas inside parentheses
      const gradientContent = matches[1];
      const parts = gradientContent.split(/,(?![^\(]*\))/);

      let currentPartIndex = 0;

      // Check for shape and size (e.g., "circle", "ellipse", "circle closest-side", etc.)
      const shapeSizePattern = /^\s*(circle|ellipse|closest-side|farthest-side|closest-corner|farthest-corner|contain|cover)?\s*(circle|ellipse|closest-side|farthest-side|closest-corner|farthest-corner|contain|cover)?\s*/i;
      let shapeSizeMatch = parts[currentPartIndex].match(shapeSizePattern);

      if (shapeSizeMatch) {
        gradient.shape = shapeSizeMatch[1] || null;
        gradient.size = shapeSizeMatch[2] || null;
        if (shapeSizeMatch[1] || shapeSizeMatch[2]) {
          currentPartIndex++;
        }
      }

      // Check for position (e.g., "at center", "at top left", etc.)
      const positionPattern = /^\s*at\s+([^\s,]+)\s+([^\s,]+)\s*/i;
      let positionMatch = parts[currentPartIndex].match(positionPattern);

      if (positionMatch) {
        gradient.position = `${positionMatch[1]} ${positionMatch[2]}`;
        currentPartIndex++;
      }

      // Extract color stops
      for (let i = currentPartIndex; i < parts.length; i++) {
        const colorStop = parts[i].trim();
        gradient.colorStops.push(colorStop);
      }

      return gradient;
    }

    function parseConicGradient(matches) {
      const parts = matches[1].split(/,(.+)/);
      const angle = parts[0].trim();
      const colorStops = parseColorStops(parts[1]);
      return { type: 'conic-gradient', angle, colorStops };
    }

    let matches;
    if ((matches = gradient.match(linearGradientRegex))) {
      return parseLinearGradient(gradient);
    } else if ((matches = gradient.match(radialGradientRegex))) {
      return parseRadialGradient(gradient);
    } else if ((matches = gradient.match(conicGradientRegex))) {
      return parseConicGradient(matches);
    } else {
      throw new Error('Unsupported gradient format');
    }
  }

  function getColorInRGBAFromString(value: string) {
    if (value.startsWith('var(')) {
      const result: ParsedColorVariable = {
        type: 'variable',
        ref: value
      };
      return result;
    }

    // handle transparent
    if (value === 'transparent') {
      const result: ParsedColorRGBA = {
        type: 'rgba',
        rgba: [255, 255, 255, 0]
      };
      return result;
    }

    // handle rgb/rgba
    if (value.startsWith('rgb')) {
      const matches = value.match(/rgba?\((\d+),\s{0,}(\d+),\s{0,}(\d+)(?:,\s{0,}(\d+\.?\d*))?\)/);
      if (!matches) throw new Error(`Invalid RGB/RGBA format: ${rgb}`);
      const rgba: ParsedColorRGBA['rgba'] = [];
      for (let i = 1; i < 3; i++) {
        rgba.push(parseInt(matches[i], 10));
      }
      if (matches[4]) {
        rgba.push(parseFloat(matches[4]));
      } else {
        rgba.push(1);
      }
      const result: ParsedColorRGBA = {
        type: 'rgba',
        rgba: rgba
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

    // handle gradient
    if (value.startsWith('linear-gradient') || value.startsWith('radial-gradient') || value.startsWith('conic-gradient')) {
      return parseGradient(value);
    }

    // handle url
    if (value.startsWith('url')) {
      const result: ParsedColorURL = {
        type: 'url',
        ref: value
      };
      return result
    }

    // handle named colors
    const foundColor = namedColors[propertyValue];
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

  return getColorInRGBAFromString(propertyValue);
}
