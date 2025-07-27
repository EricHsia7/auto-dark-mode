import { ModelComponent } from './component';
import { CSSColor, CSSRGB, CSSRGBA } from './css-model';
import { hslToRgb } from './hsl-to-rgb';
import { invertColor } from './invert-color';

function invertCSSModel(modelComponent: ModelComponent<CSSColor>, darkened: boolean = false): ModelComponent<CSSColor> {
  switch (modelComponent.model) {
    case 'rgb': {
      const [red, green, blue, alpha] = modelComponent.components;

      if (red.type !== 'number' || green.type !== 'number' || blue.type !== 'number') return modelComponent;

      const [R, G, B] = invertColor(red.number, green.number, blue.number, darkened);

      if (alpha === undefined) {
        const result: ModelComponent<CSSRGB> = {
          type: 'model',
          model: 'rgb',
          components: [
            { type: 'number', number: R, unit: '' },
            { type: 'number', number: G, unit: '' },
            { type: 'number', number: B, unit: '' }
          ]
        };
        return result;
      } else if (alpha.type === 'number' && alpha.number === 1) {
        const result: ModelComponent<CSSRGB> = {
          type: 'model',
          model: 'rgb',
          components: [
            { type: 'number', number: R, unit: '' },
            { type: 'number', number: G, unit: '' },
            { type: 'number', number: B, unit: '' }
          ]
        };
        return result;
      } else if (alpha.type === 'number' && alpha.unit === '') {
        const result: ModelComponent<CSSRGBA> = {
          type: 'model',
          model: 'rgba',
          components: [{ type: 'number', number: R, unit: '' }, { type: 'number', number: G, unit: '' }, { type: 'number', number: B, unit: '' }, alpha]
        };
        return result;
      } else {
        const result: ModelComponent<CSSRGBA> = {
          type: 'model',
          model: 'rgba',
          components: [{ type: 'number', number: R, unit: '' }, { type: 'number', number: G, unit: '' }, { type: 'number', number: B, unit: '' }, alpha]
        };
        return result;
      }
    }

    case 'rgba': {
      const [red, green, blue, alpha] = modelComponent.components;

      if (red.type !== 'number' || green.type !== 'number' || blue.type !== 'number' || alpha === undefined) return modelComponent;

      const [R, G, B] = invertColor(red.number, green.number, blue.number, darkened);

      if (alpha.type === 'number') {
        if (alpha.number === 1) {
          const result: ModelComponent<CSSRGB> = {
            type: 'model',
            model: 'rgb',
            components: [
              { type: 'number', number: R, unit: '' },
              { type: 'number', number: G, unit: '' },
              { type: 'number', number: B, unit: '' }
            ]
          };
          return result;
        } else {
          const result: ModelComponent<CSSRGBA> = {
            type: 'model',
            model: 'rgba',
            components: [
              { type: 'number', number: R, unit: '' },
              { type: 'number', number: G, unit: '' },
              { type: 'number', number: B, unit: '' },
              { type: 'number', number: alpha, unit: '' }
            ]
          };
          return result;
        }
      } else {
        const result: ModelComponent<CSSRGBA> = {
          type: 'model',
          model: 'rgba',
          components: [
            { type: 'number', number: R, unit: '' },
            { type: 'number', number: G, unit: '' },
            { type: 'number', number: B, unit: '' },
            { type: 'number', number: alpha, unit: '' }
          ]
        };
        return result;
      }
    }

    case 'hsl': {
      const [hue, saturation, lightness, alpha] = modelComponent.components;

      if (hue.type !== 'number' || saturation.type !== 'number' || lightness.type !== 'number') return modelComponent;
      if (hue.unit !== '' || saturation.unit !== '%' || lightness.unit !== '%') return modelComponent;

      const [R, G, B] = hslToRgb(hue, saturation, lightness);
      const [R1, G1, B1] = invertColor(R, G, B, darkened);

      if (alpha.type === 'number') {
        if (alpha.number === 1) {
          const result: ModelComponent<CSSRGB> = {
            type: 'model',
            model: 'rgb',
            components: [
              { type: 'number', number: R1, unit: '' },
              { type: 'number', number: G1, unit: '' },
              { type: 'number', number: B1, unit: '' }
            ]
          };
          return result;
        } else {
          const result: ModelComponent<CSSRGBA> = {
            type: 'model',
            model: 'rgba',
            components: [
              { type: 'number', number: R1, unit: '' },
              { type: 'number', number: G1, unit: '' },
              { type: 'number', number: B1, unit: '' },
              { type: 'number', number: alpha, unit: '' }
            ]
          };
          return result;
        }
      } else {
        const result: ModelComponent<CSSRGBA> = {
          type: 'model',
          model: 'rgba',
          components: [
            { type: 'number', number: R, unit: '' },
            { type: 'number', number: G, unit: '' },
            { type: 'number', number: B, unit: '' },
            { type: 'number', number: alpha, unit: '' }
          ]
        };
        return result;
      }
    }

    default:
      break;
  }
}
