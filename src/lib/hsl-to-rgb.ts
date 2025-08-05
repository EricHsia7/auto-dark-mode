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
  function f(channel: string, n: number) {
    container[`${baseName}-${channel}-k`] = `calc(mod(${n.toString()} + ${H} / 30, 12))`;
    container[`${baseName}-${channel}-a`] = `calc(${S} * min(${L}, 100% - ${L}))`;
  }

  /*

function hslToRgb(hue, sat, light) {
  sat /= 100;
  light /= 100;

  function f(n) {
    let k = (n + hue / 30) % 12;
    let a = sat * Math.min(light, 1 - light);
    return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  }

  return [f(0), f(8), f(4)];
}
*/

  const baseName = `--${id}`;
  const H = stringifyComponent(hue, cssPrimaryDelimiters);
  const S = stringifyComponent(saturation, cssPrimaryDelimiters);
  const L = stringifyComponent(lightness, cssPrimaryDelimiters);

  container[`${baseName}-h-k`] = `calc(${H} / 60)`;
  container[`${baseName}-h-a`] = `calc((1 - abs(2 * ${L} - 1)) * ${S})`;
  container[`${baseName}-x`] = `calc(var(${baseName}-c) * (1 - abs(mod(i,2) - 1)))`;
  container[`${baseName}-m`] = `calc(var(${baseName}-c) * (1 - abs(mod(i,2) - 1)))`;

  const i = hue / 60;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs((i % 2) - 1));
  const m = lightness - chroma / 2;

  const pattern = [
    [chroma, x, 0],
    [x, chroma, 0],
    [0, chroma, x],
    [0, x, chroma],
    [x, 0, chroma],
    [chroma, 0, x]
  ][Math.floor(i) % 6];

  const [R, G, B] = pattern;

  // Convert to 0–255 and return
  const R1 = Math.round((R + m) * 255);
  const G1 = Math.round((G + m) * 255);
  const B1 = Math.round((B + m) * 255);

  return [R1, G1, B1];
}
