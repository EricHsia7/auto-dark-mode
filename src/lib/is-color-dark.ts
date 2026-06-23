import { clamp } from './clamp';
import { sigmoid } from './sigmoid';

export function isColorDark(red: number, green: number, blue: number, alpha: number | undefined = 1): number {
  if (alpha === undefined) alpha = 1;
  const p = sigmoid(9.733 - 0.0207 * red - 0.01568 * green - 0.04519 * blue); // logistic regression
  const q = sigmoid(9.19 * (alpha - 0.5)); // 2ln(99) ≈ 9.19
  // ./data/darkness.csv
  return p * q;
  // higher number means higher probability
}
