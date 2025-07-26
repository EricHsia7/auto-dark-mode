import { ParsingFailed, ModelComponent, parseComponent } from './component';

export type CSSLinearGradient = 'linear-gradient';
export type CSSRadialGradient = 'radial-gradient';
export type CSSConicGradient = 'conic-gradient';

export type CSSGradient = CSSLinearGradient | CSSRadialGradient | CSSConicGradient;

export type CSSRGB = 'rgb';
export type CSSRGBA = 'rgba';
export type CSSHSL = 'hsl';
export type CSSHSLA = 'hsla';
export type CSSColorMix = 'color-mix';

export type CSSColor = CSSRGB | CSSRGBA | CSSHSL | CSSHSLA | CSSColorMix;

export type CSSVAR = 'var';

export type CSSCalc = 'calc';

export const CSSColors: Array<CSSColor> = ['rgb', 'rgba', 'hsl', 'hsla', 'color-mix'];

export const CSSGradients: Array<CSSGradient> = ['linear-gradient', 'radial-gradient', 'conic-gradient'];

export function isColor(modelComponent: ModelComponent<string>): modelComponent is ModelComponent<CSSColor> {
  return CSSColors.indexOf(modelComponent.model as CSSColor) > -1;
}

export function isGradient(modelComponent: ModelComponent<string>): modelComponent is ModelComponent<CSSGradient> {
  return CSSGradients.indexOf(modelComponent.model as CSSGradient) > -1;
}

export function isVariable(modelComponent: ModelComponent<string>): modelComponent is ModelComponent<CSSVAR> {
  return (modelComponent.model as CSSVAR) === 'var';
}

export function parseCSSModel(value: string): ModelComponent<CSSColor | CSSGradient | CSSVAR> | ParsingFailed {
  const object = parseComponent(value);
  if (object === undefined) {
    return undefined;
  }

  if (object.type === 'string') {
    if (/^#[a-f0-9]{3,8}/i.test(object.string)) {
      const string = object.string;
      const len = string.length;

      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;
      switch (len) {
        case 4:
          // #fff
          red = parseInt(string[1] + string[1], 16);
          green = parseInt(string[2] + string[2], 16);
          blue = parseInt(string[3] + string[3], 16);
          alpha = 1;
          break;
        case 7:
          // #ffffff
          red = parseInt(string.slice(1, 3), 16);
          green = parseInt(string.slice(3, 5), 16);
          blue = parseInt(string.slice(5, 7), 16);
          alpha = 1;
          break;
        case 9:
          // #ffffffff
          red = parseInt(string.slice(1, 3), 16);
          green = parseInt(string.slice(3, 5), 16);
          blue = parseInt(string.slice(5, 7), 16);
          alpha = parseInt(string.slice(7, 9), 16) / 255;
          break;
        default:
          break;
      }

      if (alpha === 1) {
        const result: ModelComponent<CSSRGB> = {
          type: 'model',
          model: 'rgb',
          components: [
            { type: 'number', number: red, unit: '' },
            { type: 'number', number: green, unit: '' },
            { type: 'number', number: blue, unit: '' }
          ]
        };
        return result;
      } else {
        const result: ModelComponent<CSSRGBA> = {
          type: 'model',
          model: 'rgba',
          components: [
            { type: 'number', number: red, unit: '' },
            { type: 'number', number: green, unit: '' },
            { type: 'number', number: blue, unit: '' },
            { type: 'number', number: alpha, unit: '' }
          ]
        };
        return result;
      }
    }
  }

  if (object.type === 'number') {
    return undefined;
  }

  if (object.type === 'model') {
    if (isColor(object) || isGradient(object) || isVariable(object)) {
      return object;
    }
  }

  return undefined;
}
