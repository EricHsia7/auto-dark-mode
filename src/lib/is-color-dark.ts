import { clamp } from './clamp';
import { ModelComponent } from './component';
import { CSSRGB, CSSRGBA } from './css-model';

export function isColorDark(color: ModelComponent<CSSRGB | CSSRGBA>): number {
  let [red, green, blue, alpha] = color.components;
  if (red.type !== 'number' || green.type !== 'number' || blue.type !== 'number') return 0;
  if (alpha !== undefined) {
    if (alpha.type !== 'number') return 0;
  }

  if (alpha === undefined) {
    alpha = {
      type: 'number',
      number: 1,
      unit: ''
    };
  }

  const p = -0.002315205943 * red.number + 0.724916473719 + -0.00518915994 * green.number + 1.093306292424 - 0.001444153598 * blue.number + 0.627977492263;
  const q = clamp(0, p * alpha.number, 1);
  // ./data/darkness.csv
  return q;
  // higher number means higher probability
}
