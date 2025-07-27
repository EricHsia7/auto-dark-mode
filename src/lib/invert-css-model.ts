import { ModelComponent } from './component';
import { CSSColor, CSSRGB, CSSRGBA } from './css-model';
import { invertColor } from './invert-color';

function invertCSSModel(modelComponent: ModelComponent<CSSColor>, darkened: boolean = false): ModelComponent<CSSColor> {
  switch (modelComponent.model) {
    case 'rgb': {
      const [red, green, blue, alpha] = modelComponent.components;

      if (red.type !== 'number' || green.type !== 'number' || blue.type !== 'number') return modelComponent;

      const [R, G, B] = invertColor(red.number, green.number, blue.number, darkened);

      if (alpha !== undefined && alpha.type === 'number') {
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
      }

      break;
    }

    default:
      break;
  }
}
