import { alphaToProbability } from './alpha-to-probability';
import { sigmoid } from './sigmoid';

export function isColorDark(red: number, green: number, blue: number, alpha: number | undefined = 1): number {
  if (alpha === undefined) alpha = 1;
  const p = sigmoid(9.733 - 0.0207 * red - 0.01568 * green - 0.04519 * blue); // logistic regression
  const q = alphaToProbability(alpha);
  // ./data/darkness.csv
  return p * q;
  // higher number means higher probability
}
