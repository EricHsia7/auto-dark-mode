import { Component, stringifyComponent } from './component';
import { cssPrimaryDelimiters } from './css-delimiters';
import { getConvertedHSLCSSVariables, hslToRgb } from './hsl-to-rgb';
import { CSSProperties } from './styles';

export function hwbToRgb(hue: number, white: number, black: number): [red: number, green: number, blue: number] {
  if (white + black >= 1) {
    const gray = Math.round((white / (white + black)) * 255);
    return [gray, gray, gray];
  }
  const [r, g, b] = hslToRgb(hue, 1, 0.5);
  const x = 1 - white - black;
  const y = white * 255;

  const R = Math.round(x * r + y);
  const G = Math.round(x * g + y);
  const B = Math.round(x * b + y);

  return [R, G, B];
}

export function getConvertedHWBCSSVariables(id: string, hue: Component, white: Component, black: Component, container: CSSProperties): [red: ModelComponent<CSSVAR>, green: ModelComponent<CSSVAR>, blue: ModelComponent<CSSVAR>] {
  const baseName = `--${id}-hwb`;
  const H = `calc(${stringifyComponent(hue, cssPrimaryDelimiters)} / 1deg)`;
  const W = `calc(${stringifyComponent(white, cssPrimaryDelimiters)} / 100%)`;
  const B = `calc(${stringifyComponent(black, cssPrimaryDelimiters)} / 100%)`;
  container[`${baseName}-wb`] = `calc(${W} + ${B})`;
  container[`${baseName}-ratio`] = `round(down,clamp(0,var(${baseName}-wb),1))`;
  container[`${baseName}-gray`] = `calc(${W} / var(${baseName}-wb))`;
  container[`${baseName}-x`] = `calc(1 - var(${baseName}-wb))`;
  container[`${baseName}-y`] = `calc(${W} * 255)`;
  const [r, g, b] = getConvertedHSLCSSVariables(id, H, { type: 'number', number: 100, unit: '%' }, { type: 'number', number: 50, unit: '%' }, container);
  container[`${baseName}-r`] = `round(clamp(0,calc(var(${baseName}-x) * ${stringifyComponent(r, cssPrimaryDelimiters)} + var(${baseName}-y)),255))`;
  container[`${baseName}-g`] = `round(clamp(0,alc(var(${baseName}-x) * ${stringifyComponent(g, cssPrimaryDelimiters)} + var(${baseName}-y)),255))`;
  container[`${baseName}-b`] = `round(clamp(0,calc(var(${baseName}-x) * ${stringifyComponent(b, cssPrimaryDelimiters)} + var(${baseName}-y)),255))`;

  return [
    {
      type: 'model',
      model: 'var',
      components: [{ type: 'string', string: `${baseName}-r` }]
    },
    {
      type: 'model',
      model: 'var',
      components: [{ type: 'string', string: `${baseName}-g` }]
    },
    {
      type: 'model',
      model: 'var',
      components: [{ type: 'string', string: `${baseName}-b` }]
    }
  ];
}
