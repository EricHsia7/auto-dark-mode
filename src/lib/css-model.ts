import { ModelComponent } from './component';

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
