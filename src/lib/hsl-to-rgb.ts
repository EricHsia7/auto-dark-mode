import { Component, ModelComponent, stringifyComponent } from './component';
import { cssPrimaryDelimiters } from './css-delimiters';
import { CSSVAR } from './css-model';
import { CSSProperties } from './styles';

export function hslToRgb(hue: number, saturation: number, lightness: number): [red: number, green: number, blue: number] {
  const i = hue / 60;
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs((i % 2) - 1));
  const m = lightness - c / 2;

  const pattern = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x]
  ][Math.floor(i) % 6];

  const [R, G, B] = pattern;

  // Convert to 0–255 and return
  const R1 = Math.round((R + m) * 255);
  const G1 = Math.round((G + m) * 255);
  const B1 = Math.round((B + m) * 255);

  return [R1, G1, B1];
}

export function getConvertedHSLCSSVariables(id: string, hue: Component, saturation: Component, lightness: Component, container: CSSProperties): [red: ModelComponent<CSSVAR>, green: ModelComponent<CSSVAR>, blue: ModelComponent<CSSVAR>] {
  const baseName = `--${id}-hsl`;
  const H = stringifyComponent(hue, cssPrimaryDelimiters);
  const S = `calc(${stringifyComponent(saturation, cssPrimaryDelimiters)} / 100%)`;
  const L = `calc(${stringifyComponent(lightness, cssPrimaryDelimiters)} / 100%)`;
  // this operation requires unit algebra proposed in CSS Values and Units Module Level 4
  // https://www.w3.org/TR/css-values-4/#additions-L3

  for (const channel of [
    ['0', 'r'],
    ['8', 'g'],
    ['4', 'b']
  ]) {
    container[`${baseName}-${channel[1]}-k`] = `calc(mod(${channel[0]} + ${H} / 30, 12))`;
    container[`${baseName}-${channel[1]}`] = `calc((${L} - ${S} * min(${L},1 - ${L}) * max(-1,min(var(${baseName}-${channel[1]}-k) - 3,9 - var(${baseName}-${channel[1]}-k),1))) * 255)`;
  }

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
