import { hslToRgb } from './hsl-to-rgb';

export function hwbToRgb(hue: number, white: number, black: number): [red: number, green: number, blue: number] {
  if (white + black >= 1) {
    const gray = Math.round((white / (white + black)) * 255);
    return [gray, gray, gray];
  }
  const [r, g, b] = hslToRgb(hue, 1, 0.5);
  const x = 1 - white - black;
  const y = white * 255;

  const R = Math.round(x * r + y);
  const G = Math.round(x * g + y);
  const B = Math.round(x * b + y);

  return [R, G, B];
}
