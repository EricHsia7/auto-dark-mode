import { clamp } from './clamp';
import { sigmoid } from './sigmoid';

export function isColorDark(red: number, green: number, blue: number, alpha: number | undefined = 1): number {
  if (alpha === undefined) alpha = 1;
  const p = sigmoid(9.733 - 0.0207 * red - 0.01568 * green - 0.04519 * blue);
  const q = clamp(0, p * alpha, 1);
  // ./data/darkness.csv
  return q;
  // higher number means higher probability
}
