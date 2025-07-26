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

export type CSSCalc = 'calc';

export const CSSColors: Array<CSSColor> = ['rgb', 'rgba', 'hsl', 'hsla', 'color-mix'];

export const CSSGradients: Array<CSSGradient> = ['linear-gradient', 'radial-gradient', 'conic-gradient'];

export function isColor(modelComponent: ModelComponent<string>): boolean {
  return CSSColors.indexOf(modelComponent.model) > -1;
}

export function isGradient(modelComponent: ModelComponent<string>): boolean {
  return CSSGradients.indexOf(modelComponent.model) > -1;
}
