import { sigmoid } from './sigmoid';

export function alphaToProbability(alpha: number): number {
  return sigmoid(13.8135 * (alpha - 0.4)); // 2ln(999) ≈ 13.8135
}
