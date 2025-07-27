import { clamp } from './clamp';

export function isColorDark(red: number, green: number, blue: number, alpha: number | undefined = 1): number {
  if (alpha === undefined) alpha = 1;
  const p = -0.002315205943 * red + 0.724916473719 + -0.00518915994 * green + 1.093306292424 - 0.001444153598 * blue + 0.627977492263;
  const q = clamp(0, p * alpha, 1);
  // ./data/darkness.csv
  return q;
  // higher number means higher probability
}
