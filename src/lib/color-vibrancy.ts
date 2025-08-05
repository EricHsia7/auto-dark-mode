import { Component, ModelComponent, stringifyComponent } from './component';
import { cssPrimaryDelimiters } from './css-delimiters';
import { CSSVAR } from './css-model';
import { computeStats, getPerChannelDifference, mergeStats } from './stats';

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

export function getColorVibrancyCSSVariable(id: string, red: Component, green: Component, blue: Component, container): ModelComponent<CSSVAR> {
  const R = stringifyComponent(red, cssPrimaryDelimiters);
  const G = stringifyComponent(green, cssPrimaryDelimiters);
  const B = stringifyComponent(blue, cssPrimaryDelimiters);
  const baseName = `--${id}-vibrancy`;
  const mergedNumber = baseStats.n + 1;
  const x = baseStats.n * (Math.pow(baseStats.stdev[0], 2) + Math.pow(baseStats.avg[0], 2));
  const y = baseStats.n * (Math.pow(baseStats.stdev[1], 2) + Math.pow(baseStats.avg[1], 2));
  const z = baseStats.n * (Math.pow(baseStats.stdev[2], 2) + Math.pow(baseStats.avg[2], 2));
  container[`${baseName}-rg-avg`] = `calc((${baseStats.avg[0] * baseStats.n} + ${R}) / ${mergedNumber})`;
  container[`${baseName}-gb-avg`] = `calc((${baseStats.avg[1] * baseStats.n} + ${G}) / ${mergedNumber})`;
  container[`${baseName}-br-avg`] = `calc((${baseStats.avg[2] * baseStats.n} + ${B}) / ${mergedNumber})`;
  container[`${baseName}-rg-stdev`] = `calc((${x} + pow(${R},2)) / ${mergedNumber} - pow(var(${baseName}-rg-avg),2))`;
  container[`${baseName}-gb-stdev`] = `calc((${y} + pow(${G},2)) / ${mergedNumber} - pow(var(${baseName}-rg-avg),2))`;
  container[`${baseName}-br-stdev`] = `calc((${z} + pow(${B},2)) / ${mergedNumber} - pow(var(${baseName}-rg-avg),2))`;
  container[`${baseName}-d`] = `calc((abs(${R} - ${G}) - var(${baseName}-rg-avg)) / var(${baseName}-rg-stdev))`;
  container[`${baseName}-e`] = `calc((abs(${G} - ${B}) - var(${baseName}-gb-avg)) / var(${baseName}-gb-stdev))`;
  container[`${baseName}-f`] = `calc((abs(${B} - ${R}) - var(${baseName}-br-avg)) / var(${baseName}-br-stdev))`;
  container[`${baseName}-v`] = `calc((var(${baseName}-d) + var(${baseName}-e) + var(${baseName}-f)) / 3)`;
  return {
    type: 'model',
    model: 'var',
    components: [{ type: 'string', string: `${baseName}-v` }]
  };
}
