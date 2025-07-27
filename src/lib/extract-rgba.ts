import { ModelComponent } from './component';
import { CSSColor, CSSGradient, CSSVAR } from './css-model';

export function extractRGBA(modelComponent: ModelComponent<CSSColor | CSSVAR | CSSGradient>): [red: number, green: number, blue: number, alpha: number] | undefined {
  switch (modelComponent.model) {
    case 'rgb': {
      const [red, green, blue, alpha] = modelComponent.components;

      if (typeof red !== 'object' || typeof green !== 'object' || typeof blue !== 'object') return [0, 0, 0, 0];
      if (red?.type !== 'number' || green?.type !== 'number' || blue?.type !== 'number') return [0, 0, 0, 0];

      if (alpha === undefined) {
        return [red.number, green.number, blue.number, 1];
      } else if (alpha.type === 'number') {
        return [red.number, green.number, blue.number, alpha.number];
      }
      break;
    }
    default:
      break;
  }
}
