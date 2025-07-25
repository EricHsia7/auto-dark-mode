export function hsl_rgb(hue: number, saturation: number, lightness: number): [red: number, green: number, blue: number] {
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

  return [red, green, blue];
}
