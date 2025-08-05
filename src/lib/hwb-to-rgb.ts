import { Component, stringifyComponent } from './component';
import { cssPrimaryDelimiters } from './css-delimiters';
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
  const W = `calc(${stringifyComponent(white, cssPrimaryDelimiters)} / 100%)`;
  const B = `calc(${stringifyComponent(black, cssPrimaryDelimiters)} / 100%)`;
  // this operation requires unit algebra proposed in CSS Values and Units Module Level 4
  // https://www.w3.org/TR/css-values-4/#additions-L3

  container[`${baseName}-ratio`] = `round(down,clamp(0,${W} + ${B},1))`;
  container[`${baseName}-gray`] = `calc(${W} / (${W} + ${B} + 0.01))`;
  container[`${baseName}-x`] = `calc(1 - ${W} - ${B})`;
  container[`${baseName}-y`] = `${W}`;
  const H = stringifyComponent(hue, cssPrimaryDelimiters);
  for (const channel of [
    ['0', 'r'],
    ['8', 'g'],
    ['4', 'b']
  ]) {
    container[`${baseName}-${channel[1]}-k`] = `calc(mod(${channel[0]} + ${H} / 30deg, 12))`;
    container[`${baseName}-${channel[1]}-t`] = `calc(0.5 - 0.5 * max(-1,min(var(${baseName}-${channel[1]}-k) - 3,9 - var(${baseName}-${channel[1]}-k),1)))`;
    container[`${baseName}-${channel[1]}`] = `round(clamp(0, calc((((1 - ${W} - ${B}) * var(${baseName}-${channel[1]}-t) + ${W}) * (1 - var(${baseName}-ratio)) + var(${baseName}-gray) * var(${baseName}-ratio)) * 255), 255))`;
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
