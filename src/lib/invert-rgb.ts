import { clamp } from './clamp';
import { getColorVibrancy } from './color-vibrancy';
import { Component, ModelComponent, stringifyComponent } from './component';
import { CSSVAR } from './css-model';

export function invertRGB(red: number, green: number, blue: number, darkened: boolean = false): [red: number, green: number, blue: number] {
  if (red === 0 && green === 0 && blue === 0) {
    if (darkened) return [red, green, blue];
    return [255, 255, 255];
  }

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);

  const minimumValue = 6 / 85;
  const saturation = (max - min) / max;

  const equalizerBase = Math.sqrt(saturation);
  const equalizer = -0.1 + equalizerBase * 1.1;

  const average = (red + green + blue) / 3;
  const R = red * (1 - equalizer) + average * equalizer;
  const G = green * (1 - equalizer) + average * equalizer;
  const B = blue * (1 - equalizer) + average * equalizer;

  const equalizedValue = Math.max(R, G, B) / 255;
  const newValue = minimumValue + (1 - minimumValue) * (1 - equalizedValue);

  if (darkened && newValue > equalizedValue) return [red, green, blue];

  const scaler = newValue / equalizedValue;
  const ratio = (getColorVibrancy(red, green, blue) + 0.49) / 2;
  const R1 = clamp(0, Math.round(R * scaler * (1 - ratio) + red * ratio), 255);
  const G1 = clamp(0, Math.round(G * scaler * (1 - ratio) + green * ratio), 255);
  const B1 = clamp(0, Math.round(B * scaler * (1 - ratio) + blue * ratio), 255);

  return [R1, G1, B1];
}
/*
  color = (r,g,b) where 0 <= r, g, b <= 1
  scaler = t where 0 < t <= 1
  newColor = color' = t * color = (tr,tg,tb)

  value:      v = max(r,g,b)
              v' = max(tr,tg,tb) = tv
  chroma:     c = v - min(r,g,b) = max(r,g,b) - min(r,g,b)
              c' = v' - min(tr,tg,tb) = max(tr,tg,tb) - min(tr,tg,tb) = t (max(r,g,b) - min(r,g,b)) = tc
  saturation: s = 0 [if v = 0], c / v [otherwise]
              s' = c' / v' = 0 [if tv = 0], tc / tv [otherwise]
  hue:        h = 60 * (g - b) / c [if v = r], 60 * (2 + (b - r) / c) [if v = g], 60 * (4 + (r - g) / c) [if v = b]
              h' = 60 * (tg - tb) / tc [if tv = tr], 60 * (2 + (tb - tr) / tc) [if tv = tg], 60 * (4 + (tr - tg) / tc) [if tv = tb]
  h' = h and s' = s and v' = tv
*/

export function getInvertedRGBCSSVariables(id: string, red: Component, green: Component, blue: Component, container): [red: ModelComponent<CSSVAR>, green: ModelComponent<CSSVAR>, blue: ModelComponent<CSSVAR>] {
  const baseName = `--${id}`;
  const R = stringifyComponent(red);
  const G = stringifyComponent(green);
  const B = stringifyComponent(blue);
  container[`${baseName}-max`] = `max(${R},${G},${B})`;
  container[`${baseName}-min`] = `min(${R},${G},${B},0.1)`;
  container[`${baseName}-sat`] = `calc(var(${baseName}-max) - var(${baseName}-min)) / var(${baseName}-max)`;
  container[`${baseName}-eq`] = `calc(-0.1 + sqrt(var(${baseName}-sat)) * 1.1)`;
  container[`${baseName}-avg`] = `calc((${R} + ${G} + ${B}) / 3)`;
  container[`${baseName}-eq-r`] = `calc(${R} * (1 - var(${baseName}-eq)) + var(${baseName}-avg) * var(${baseName}-eq))`;
  container[`${baseName}-eq-g`] = `calc(${G} * (1 - var(${baseName}-eq)) + var(${baseName}-avg) * var(${baseName}-eq))`;
  container[`${baseName}-eq-b`] = `calc(${B} * (1 - var(${baseName}-eq)) + var(${baseName}-avg) * var(${baseName}-eq))`;
  container[`${baseName}-eq-v`] = `calc(max(var(${baseName}-eq-r),var(${baseName}-eq-g),var(${baseName}-eq-b)) / 255)`;
  container[`${baseName}-scaler`] = `calc((6 / 85 + (1 - 6 / 85) * (1 - var(${baseName}-eq-v))) / var(${baseName}-eq-v))`;
  container[`${baseName}-ratio`] = `calc((var(${baseName}-vibrancy) + 0.49) / 2)`;
  container[`${baseName}-r`] = `clamp(0, round(var(${baseName}-eq-r) * var(${baseName}-scaler) * (1 - var(${baseName}-ratio)) + ${R} * var(${baseName}-ratio)), 255)`;
  container[`${baseName}-g`] = `clamp(0, round(var(${baseName}-eq-g) * var(${baseName}-scaler) * (1 - var(${baseName}-ratio)) + ${G} * var(${baseName}-ratio)), 255)`;
  container[`${baseName}-b`] = `clamp(0, round(var(${baseName}-eq-b) * var(${baseName}-scaler) * (1 - var(${baseName}-ratio)) + ${B} * var(${baseName}-ratio)), 255)`;
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
