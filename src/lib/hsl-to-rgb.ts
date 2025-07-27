export function hslToRgb(hue: number, saturation: number, lightness: number): [red: number, green: number, blue: number] {
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

  const [R, G, B] = pattern;

  // Convert to 0–255 and return
  const R1 = Math.round((R + m) * 255);
  const G1 = Math.round((G + m) * 255);
  const B1 = Math.round((B + m) * 255);

  return [R1, G1, B1];
}
