import { ParsedColor, ParsedColorConicGradient, ParsedColorLinearGradient, ParsedColorRdialGradient, ParsedColorRGBA, ParsedColorStop, ParsedColorStopArray, ParsedColorVariable } from './parse-color';

export function invertRGBA(color: ParsedColorRGBA): ParsedColorRGBA {
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

  let invertible: boolean = false;
  if (originalSaturation <= 38) {
    invertible = true;
  } else {
    if (originalValue <= 46) {
      invertible = true;
    }
  }

  if (!invertible) return color;

  const newHue = originalHue;
  const newSaturation = originalSaturation * 0.2;
  const newValue = 1 - originalValue;

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
}

export function invertColor(color: ParsedColor): ParsedColor {
  function invertStops(colorStops: ParsedColorStopArray) {
    const colorStopsLength = colorStops.length;
    const invertedStops: ParsedColorStopArray = [];
    for (let i = 0; i < colorStopsLength; i++) {
      const stop = colorStops[i];
      if (stop.type === 'stop') {
        const invertedColor = invertColor(stop.color) as ParsedColorRGBA | ParsedColorVariable;
        const invertedColorStop: ParsedColorStop = {
          type: 'stop',
          color: invertedColor,
          position: stop.position
        };
        invertedStops.push(invertedColorStop);
      }
    }
    return invertedStops;
  }
  switch (color.type) {
    case 'rgba': {
      return invertRGBA(color);
      break;
    }
    case 'variable': {
      return color; // Variables are not inverted
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
    case 'radial-gradient':
      {
        const invertedColors = invertStops(color.colorStops);
        const result: ParsedColorRdialGradient = {
          type: 'radial-gradient',
          position: color.position,
          shape: color.shape,
          size: color.size,
          colorStops: invertedColors
        };
        return result;
      }
      break;
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
    case 'url':
      return color; // URLs are not inverted
    default:
      return color; // Fallback for any other types
  }
}
