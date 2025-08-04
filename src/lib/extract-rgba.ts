import { angleToDegrees } from './angle-to-degree';
import { clamp } from './clamp';
import { ModelComponent } from './component';
import { CSSColor, CSSGradient, CSSVAR, isColor, isVariable, parseCSSModel } from './css-model';
import { isAngle } from './css-units';
import { hslToRgb } from './hsl-to-rgb';
import { hwbToRgb } from './hwb-to-rgb';

export function extractRGBA(modelComponent: ModelComponent<CSSColor | CSSVAR | CSSGradient>): [red: number, green: number, blue: number, alpha: number] {
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

      return [0, 0, 0, 0];
    }

    case 'rgb': {
      const [red, green, blue, alpha] = modelComponent.components;

      if (typeof red !== 'object' || typeof green !== 'object' || typeof blue !== 'object') return [0, 0, 0, 0];
      if (red?.type !== 'number' || green?.type !== 'number' || blue?.type !== 'number') return [0, 0, 0, 0];

      if (alpha === undefined) {
        return [red.number, green.number, blue.number, 1];
      } else if (alpha.type === 'number') {
        return [red.number, green.number, blue.number, alpha.number];
      }

      return [0, 0, 0, 0];
    }

    case 'rgba': {
      const [red, green, blue, alpha] = modelComponent.components;
      if (typeof red !== 'object' || typeof green !== 'object' || typeof blue !== 'object' || typeof alpha !== 'object') return [0, 0, 0, 0];
      if (red?.type !== 'number' || green?.type !== 'number' || blue?.type !== 'number' || alpha?.type !== 'number') return [0, 0, 0, 0];

      return [red.number, green.number, blue.number, alpha.number];
    }

    case 'hsl': {
      const [hue, saturation, lightness, alpha] = modelComponent.components;
      if (typeof hue !== 'object' || typeof saturation !== 'object' || typeof lightness !== 'object') return [0, 0, 0, 0];
      if (hue.type !== 'number' || saturation.type !== 'number' || lightness.type !== 'number') return [0, 0, 0, 0];
      if (hue.unit !== '' || saturation.unit !== '%' || lightness.unit !== '%') return [0, 0, 0, 0];

      const [R, G, B] = hslToRgb(hue.number, saturation.number / 100, lightness.number / 100);

      if (alpha === undefined) {
        return [R, G, B, 1];
      } else if (alpha.type === 'number') {
        return [R, G, B, alpha.number];
      }

      return [0, 0, 0, 0];
    }

    case 'hsla': {
      const [hue, saturation, lightness, alpha] = modelComponent.components;
      if (typeof hue !== 'object' || typeof saturation !== 'object' || typeof lightness !== 'object' || typeof alpha !== 'object') return [0, 0, 0, 0];
      if (hue.type !== 'number' || saturation.type !== 'number' || lightness.type !== 'number' || alpha.type !== 'number') return [0, 0, 0, 0];
      if (hue.unit !== '' || saturation.unit !== '%' || lightness.unit !== '%') return [0, 0, 0, 0];

      const [R, G, B] = hslToRgb(hue.number, saturation.number / 100, lightness.number / 100);

      return [R, G, B, alpha.number];
    }

    case 'hwb': {
      const [hue, white, black, alpha] = modelComponent.components;
      if (typeof hue !== 'object' || typeof black !== 'object' || typeof white !== 'object') return [0, 0, 0, 0];
      if (hue.type !== 'number' || white.type !== 'number' || black.type !== 'number') return [0, 0, 0, 0];
      if (!isAngle(hue)) return [0, 0, 0, 0];
      if (white.unit !== '' && white.unit !== '%') return [0, 0, 0, 0];
      if (black.unit !== '' && black.unit !== '%') return [0, 0, 0, 0];

      const [R, G, B] = hwbToRgb(angleToDegrees(hue.number), white.number / 100, black.number / 100);

      if (alpha === undefined) {
        return [R, G, B, 1];
      } else if (alpha.type === 'number') {
        return [R, G, B, alpha.number];
      }
    }

    case 'var': {
      const components = modelComponent.components;
      const componentsLen = components.length;
      const rgba: [red: number, green: number, blue: number, alpha: number] = [0, 0, 0, 0];
      for (let i = componentsLen - 1; i >= 0; i--) {
        const component = components[i];
        if (component.type === 'model') {
          if (isColor(component) || isVariable(component)) {
            const extractedRGBA = extractRGBA(component);
            if (extractedRGBA[3] === 0) continue;
            rgba[0] += extractedRGBA[0] * extractedRGBA[3];
            rgba[1] += extractedRGBA[1] * extractedRGBA[3];
            rgba[2] += extractedRGBA[2] * extractedRGBA[3];
            rgba[3] += extractedRGBA[3];
          }
        } else if (component.type === 'string') {
          const parsed = parseCSSModel(component.string);
          if (parsed !== undefined) {
            if (isColor(parsed) || isVariable(parsed)) {
              const extractedRGBA = extractRGBA(parsed);
              if (extractedRGBA[3] === 0) continue;
              rgba[0] += extractedRGBA[0] * extractedRGBA[3];
              rgba[1] += extractedRGBA[1] * extractedRGBA[3];
              rgba[2] += extractedRGBA[2] * extractedRGBA[3];
              rgba[3] += extractedRGBA[3];
            }
          }
        }
      }

      if (rgba[3] === 0) return [0, 0, 0, 0];
      rgba[0] /= rgba[3];
      rgba[1] /= rgba[3];
      rgba[2] /= rgba[3];
      rgba[3] = clamp(0, rgba[3], 1);
      return rgba;
    }

    default:
      break;
  }

  return [0, 0, 0, 0];
}
