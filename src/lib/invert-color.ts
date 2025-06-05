import { ParsedColorRGBA } from './parse-color';

export function invertColor(color: ParsedColorRGBA): ParsedColorRGBA {
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

  if (originalSaturation > 0.38 && originalValue > 0.46) return color;

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
