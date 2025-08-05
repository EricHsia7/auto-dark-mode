import { Component, ModelComponent, stringifyComponent } from './component';
import { cssPrimaryDelimiters } from './css-delimiters';
import { CSSVAR } from './css-model';
import { computeStats, getPerChannelDifference, mergeStats } from './stats';
import { StyleSheet } from './styles';

const baseColors: number[][] = [
  [255, 255, 255],
  [192, 192, 192],
  [128, 128, 128],
  [64, 64, 64],
  [0, 0, 0],
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255]
];

const baseStats = computeStats(baseColors); // Precompute once

export function getColorVibrancy(red: number, green: number, blue: number): number {
  const [prg, pgb, pbr] = getPerChannelDifference(red, green, blue);

  const [RG_avg, RG_stdev] = mergeStats(baseStats.avg[0], baseStats.stdev[0], baseStats.n, prg, 0, 1);
  const [GB_avg, GB_stdev] = mergeStats(baseStats.avg[1], baseStats.stdev[1], baseStats.n, pgb, 0, 1);
  const [BR_avg, BR_stdev] = mergeStats(baseStats.avg[2], baseStats.stdev[2], baseStats.n, pbr, 0, 1);

  const d = (prg - RG_avg) / RG_stdev;
  const e = (pgb - GB_avg) / GB_stdev;
  const f = (pbr - BR_avg) / BR_stdev;

  return (d + e + f) / 3;
}

export function getColorVibrancyConstantStyles(): StyleSheet {
  return {
    ':root': {
      '--auto-dark-mode-color-vibrancy-constant-number': baseStats.n.toString(),
      '--auto-dark-mode-color-vibrancy-constant-rg-avg': baseStats.avg[0].toString(),
      '--auto-dark-mode-color-vibrancy-constant-rg-stdev': baseStats.stdev[0].toString(),
      '--auto-dark-mode-color-vibrancy-constant-gb-avg': baseStats.avg[1].toString(),
      '--auto-dark-mode-color-vibrancy-constant-gb-stdev': baseStats.stdev[1].toString(),
      '--auto-dark-mode-color-vibrancy-constant-br-avg': baseStats.avg[2].toString(),
      '--auto-dark-mode-color-vibrancy-constant-br-stdev': baseStats.stdev[2].toString()
    }
  };
}

export function getColorVibrancyCSSVariable(id: string, red: Component, green: Component, blue: Component, container): ModelComponent<CSSVAR> {
  const R = stringifyComponent(red, cssPrimaryDelimiters);
  const G = stringifyComponent(green, cssPrimaryDelimiters);
  const B = stringifyComponent(blue, cssPrimaryDelimiters);
  const baseName = `--${id}`;
  container[`${baseName}-prg`] = `abs(${R} - ${G})`;
  container[`${baseName}-pgb`] = `abs(${G} - ${B})`;
  container[`${baseName}-pbr`] = `abs(${B} - ${R})`;
  container[`${baseName}-d`] = `calc((var(${baseName}-prg) - var(--auto-dark-mode-color-vibrancy-constant-rg-avg)) / var(--auto-dark-mode-color-vibrancy-constant-rg-stdev))`;
  container[`${baseName}-e`] = `calc((var(${baseName}-pgb) - var(--auto-dark-mode-color-vibrancy-constant-gb-avg)) / var(--auto-dark-mode-color-vibrancy-constant-gb-stdev))`;
  container[`${baseName}-f`] = `calc((var(${baseName}-pbr) - var(--auto-dark-mode-color-vibrancy-constant-br-avg)) / var(--auto-dark-mode-color-vibrancy-constant-br-stdev))`;
  container[`${baseName}-vibrancy`] = `calc((var(--d) + var(--e) + var(--f)) / 3)`;
  return {
    type: 'model',
    model: 'var',
    components: [{ type: 'string', string: `${baseName}-vibrancy` }]
  };
}

// const p = 0.006339594673 * Math.abs(color.rgb[0] - color.rgb[1]) + 0.1357803475 + 0.006733518277 * Math.abs(color.rgb[1] - color.rgb[2]) + 0.1787805054 + 0.005240646414 * Math.abs(color.rgb[0] - color.rgb[2]) + 0.1162090602;
// const p = 0.006669426162 * Math.abs(color.rgb[0] - color.rgb[1]) + 0.07742765348 + 0.007073453738 * Math.abs(color.rgb[1] - color.rgb[2]) + 0.1163189972 + 0.005399325815 * Math.abs(color.rgb[0] - color.rgb[2]) + 0.06675079166;
// const p = 0.006694646769 * Math.abs(color.rgb[0] - color.rgb[1]) + 0.06369476726 + 0.007040201321 * Math.abs(color.rgb[1] - color.rgb[2]) + 0.1045286998 + 0.005413701273 * Math.abs(color.rgb[0] - color.rgb[2]) + 0.05323332153;
// const q = Math.min(Math.max(p / 3, 0), 1);
// return q;
// ./data/vibrancy.csv
