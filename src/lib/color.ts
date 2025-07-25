import { _Object, buildObject } from './build-object';
import { clamp } from './clamp';
import { getSyntaxTags, hasTagAndObjectIs } from './get-syntax-tags';
import { hsl_rgb } from './hsl-to-rgb';
import { namedColors } from './named-colors';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';
import { computeStats, getPerChannelDifference, mergeStats } from './stats';
import { systemColors } from './system-colors';

export interface ColorRGB {
  type: 'rgb';
  rgb: [red: number, green: number, blue: number];
}

export type ColorRGBParameter = Variable | number;

export type ColorRGBParameterArray = Array<ColorRGBParameter>;

export interface ColorRGB_Variable {
  type: 'rgb-v';
  parameters: ColorRGBParameterArray;
}

export interface ColorRGBA {
  type: 'rgba';
  rgba: [red: number, green: number, blue: number, alpha: number];
}

export interface ColorRGBA_Variable {
  type: 'rgba-v';
  parameters: ColorRGBParameterArray;
}

export type ColorHSLParameter = Variable | number | UnitedNumber;

export type ColorHSLParameterArray = Array<ColorHSLParameter>;

export interface ColorHSL_Variable {
  type: 'hsl-v';
  parameters: ColorHSLParameterArray;
}

export interface ColorHSLA_Variable {
  type: 'hsla-v';
  parameters: ColorHSLParameterArray;
}

export interface Variable {
  type: 'variable';
  ref: string; // var(--name)
  args: Array<Color>;
}

export interface VariableName {
  type: 'variable-name';
  name: string;
}

export interface UnitedNumber {
  type: 'number-u';
  number: number;
  unit: string;
}

export interface GradientColorStop {
  type: 'color-stop';
  parameters: Array<Color | string>;
}

export type GradientParameter = GradientColorStop | string;

export type GradientParameterArray = Array<GradientParameter>;

export interface LinearGradient {
  type: 'linear-gradient';
  parameters: GradientParameterArray;
}

export interface RadialGradient {
  type: 'radial-gradient';
  parameters: GradientParameterArray;
}

export interface ConicGradient {
  type: 'conic-gradient';
  parameters: GradientParameterArray;
}

export interface _URL {
  type: 'url';
  ref: string; // url(https://example.com/example.png)
}

export interface FunctionalKeyword {
  type: 'keyword';
  value: 'currentcolor' | 'inherit' | 'initial' | 'revert' | 'unset' | 'none';
  // "transparent" is converted to rgba
  // "none" my not mean "transparent," so keep it as-is
}

export interface UnknownString {
  type: 'unknown';
  value: string;
}

export type Color = ColorRGB | ColorRGB_Variable | ColorRGBA | ColorRGBA_Variable | ColorHSL_Variable | ColorHSLA_Variable | Variable | VariableName | LinearGradient | RadialGradient | ConicGradient | _URL | FunctionalKeyword | UnknownString;

export function parseColor(object: string | _Object): Color | false {
  if (typeof object === 'string') {
    object = buildObject(object);
  }

  const tags = getSyntaxTags(object);

  if (!tags.has('color') && !tags.has('gradient') && !tags.has('variable') && !tags.has('variable-name')) return false;

  if (object.type === 'string') {
    if (tags.has('hex')) {
      const len = object.value.length;
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;
      switch (len) {
        case 4:
          // #fff
          red = parseInt(object.value[1] + object.value[1], 16);
          green = parseInt(object.value[2] + object.value[2], 16);
          blue = parseInt(object.value[3] + object.value[3], 16);
          alpha = 1;
          break;
        case 7:
          // #ffffff
          red = parseInt(object.value.slice(1, 3), 16);
          green = parseInt(object.value.slice(3, 5), 16);
          blue = parseInt(object.value.slice(5, 7), 16);
          alpha = 1;
          break;
        case 9:
          // #ffffffff
          red = parseInt(object.value.slice(1, 3), 16);
          green = parseInt(object.value.slice(3, 5), 16);
          blue = parseInt(object.value.slice(5, 7), 16);
          alpha = parseInt(object.value.slice(7, 9), 16) / 255;
          break;
        default:
          break;
      }

      if (alpha === 1) {
        const result: ColorRGB = {
          type: 'rgb',
          rgb: [red, green, blue]
        };
        return result;
      } else {
        const result: ColorRGBA = {
          type: 'rgba',
          rgba: [red, green, blue, alpha]
        };
        return result;
      }
    }

    if (tags.has('variable-name')) {
      const result: VariableName = {
        type: 'variable-name',
        name: object.value
      };
      return result;
    }

    if (tags.has('named-color')) {
      const result: ColorRGB = {
        type: 'rgb',
        rgb: namedColors[object.value]
      };
      return result;
    }

    if (tags.has('system-color')) {
      const result: ColorRGB = {
        type: 'rgb',
        rgb: systemColors[object.value]
      };
      return result;
    }

    if (tags.has('functional-keyword')) {
      const result: FunctionalKeyword = {
        type: 'keyword',
        value: object.value as FunctionalKeyword['value']
      };
      return result;
    }
  }

  if (object.type === 'model') {
    // tags.has('model')
    switch (object.model) {
      case 'rgb': {
        const params = [];
        let paramsCount = 0;
        let subModelsCount = 0;

        for (let i = 0, l = object.args.length; i < l; i++) {
          const arg = object.args[i];
          const argTags = getSyntaxTags(arg);
          if (paramsCount < 4) {
            if (argTags.has('number')) {
              params.push(arg.value);
              paramsCount++;
            } else if (argTags.has('variable')) {
              params.push(parseColor(arg));
              paramsCount++;
              subModelsCount++;
            }
          }
        }

        if (subModelsCount === 0) {
          if (paramsCount === 3) {
            const result: ColorRGB = {
              type: 'rgb',
              rgb: params as [number, number, number]
            };
            return result;
          } else if (paramsCount === 4) {
            if (params[3] === 1) {
              const result: ColorRGB = {
                type: 'rgb',
                rgb: params as [number, number, number]
              };
              return result;
            } else {
              const result: ColorRGBA = {
                type: 'rgba',
                rgba: params as [number, number, number, number]
              };
              return result;
            }
          } else {
            break;
          }
        } else {
          const result: ColorRGB_Variable = {
            type: 'rgb-v',
            parameters: params
          };
          return result;
        }
        break;
      }

      case 'rgba': {
        const params = [];
        let paramsCount = 0;
        let subModelsCount = 0;

        for (let i = 0, l = object.args.length; i < l; i++) {
          const arg = object.args[i];
          const argTags = getSyntaxTags(arg);
          if (paramsCount < 4) {
            if (argTags.has('number')) {
              params.push(arg.value);
              paramsCount++;
            } else if (argTags.has('variable')) {
              params.push(parseColor(arg));
              paramsCount++;
              subModelsCount++;
            }
          }
        }

        if (subModelsCount === 0) {
          if (paramsCount === 4) {
            if (params[3] === 1) {
              const result: ColorRGB = {
                type: 'rgb',
                rgb: params.slice(0, 3) as [number, number, number]
              };
              return result;
            } else {
              const result: ColorRGBA = {
                type: 'rgba',
                rgba: params as [number, number, number, number]
              };
              return result;
            }
          } else {
            break;
          }
        } else {
          const result: ColorRGBA_Variable = {
            type: 'rgba-v',
            parameters: params
          };
          return result;
        }
        break;
      }

      case 'hsl': {
        const params = [];
        let paramsCount = 0;
        let subModelsCount = 0;

        for (let i = 0, l = object.args.length; i < l; i++) {
          const arg = object.args[i];
          const argTags = getSyntaxTags(arg);
          if (paramsCount === 0 && hasTagAndObjectIs(arg, argTags, 'number')) {
            params.push(arg.value);
            paramsCount++;
          } else if (paramsCount === 1 || paramsCount === 2) {
            if (hasTagAndObjectIs(arg, argTags, 'percentage')) {
              params.push(arg.value / 100);
              paramsCount++;
            }
          } else if (paramsCount === 3 && argTags.has('number')) {
            params.push(arg.value);
            paramsCount++;
          }
          if (argTags.has('variable')) {
            params.push(parseColor(arg));
            paramsCount++;
            subModelsCount++;
          }
        }

        if (subModelsCount === 0) {
          if (paramsCount === 3 || paramsCount === 4) {
            const hue = params[0];
            const saturation = params[1];
            const lightness = params[2];
            const alpha = params[3] || 1;
            const [red, green, blue] = hsl_rgb(hue, saturation, lightness);
            if (alpha === 1) {
              const result: ColorRGB = {
                type: 'rgb',
                rgb: [red, green, blue]
              };
              return result;
            } else {
              const result: ColorRGBA = {
                type: 'rgba',
                rgba: [red, green, blue, alpha]
              };
              return result;
            }
          } else {
            break;
          }
        } else if (subModelsCount === 1 && paramsCount === 4 && params[3]?.type === 'model' && params[3]?.model === 'var') {
          const hue = params[0];
          const saturation = params[1];
          const lightness = params[2];
          const alpha = params[3];
          const [red, green, blue] = hsl_rgb(hue, saturation, lightness);
          const result: ColorRGBA_Variable = {
            type: 'rgba-v',
            parameters: [red, green, blue, alpha]
          };
          return result;
        } else {
          const result: ColorHSL_Variable = {
            type: 'hsl-v',
            parameters: params
          };
          return result;
        }
        break;
      }

      case 'hsla': {
        const params = [];
        let paramsCount = 0;
        let subModelsCount = 0;

        for (let i = 0, l = object.args.length; i < l; i++) {
          const arg = object.args[i];
          const argTags = getSyntaxTags(arg);
          if (paramsCount === 0 && argTags.has('number')) {
            params.push(arg.value);
            paramsCount++;
          } else if (paramsCount === 1 || paramsCount === 2) {
            if (argTags.has('percentage')) {
              params.push(arg.value / 100);
              paramsCount++;
            }
          } else if (paramsCount === 3 && argTags.has('number')) {
            params.push(arg.value);
            paramsCount++;
          }
          if (argTags.has('variable')) {
            params.push(parseColor(arg));
            paramsCount++;
            subModelsCount++;
          }
        }

        if (subModelsCount === 0) {
          if (paramsCount === 4) {
            const hue = params[0];
            const saturation = params[1];
            const lightness = params[2];
            const alpha = params[3];
            const [red, green, blue] = hsl_rgb(hue, saturation, lightness);
            if (alpha === 1) {
              const result: ColorRGB = {
                type: 'rgb',
                rgb: [red, green, blue]
              };
              return result;
            } else {
              const result: ColorRGBA = {
                type: 'rgba',
                rgba: [red, green, blue, alpha]
              };
              return result;
            }
          } else {
            break;
          }
        } else if (subModelsCount === 1 && paramsCount === 4 && params[3]?.type === 'model' && params[3]?.model === 'var') {
          const hue = params[0];
          const saturation = params[1];
          const lightness = params[2];
          const alpha = params[3];
          const [red, green, blue] = hsl_rgb(hue, saturation, lightness);
          const result: ColorRGBA_Variable = {
            type: 'rgba-v',
            parameters: [red, green, blue, alpha]
          };
          return result;
        } else {
          const result: ColorHSL_Variable = {
            type: 'hsl-v',
            parameters: params
          };
          return result;
        }
        break;
      }

      case 'var': {
        const args = object.args;
        for (let i = args.length - 1; i >= 0; i--) {
          args.splice(i, 1, parseColor(args[i]));
        }
        const result: Variable = {
          type: 'variable',
          ref: 'TODO: variable reference',
          args: args
        };
        return result;
        break;
      }

      case 'linear-gradient': {
        const parameters = [];
        let parametersCount = 0;
        const args = object.args;
        for (let i = 0, l = args.length; i < l; i++) {
          const arg = args[i];
          const argTags = getSyntaxTags(arg);
          if (arg.type === 'string') {
            const splitArgs = splitByTopLevelDelimiter(arg.value, [' ']).result;
            const splitArgsTags = [];
            const splitArgsLen = splitArgs.length;
            for (let j = splitArgsLen - 1; j >= 0; j--) {
              const splitArgObject = buildObject(splitArgs[j]);
              splitArgs.splice(j, 1, splitArgObject);
              splitArgsTags.unshift(getSyntaxTags(splitArgObject));
            }

            if (splitArgsLen === 2 && splitArgsTags[0].has('to') && splitArgsTags[1].has('cardinal')) {
              parameters.push(`to ${splitArgs[1].value}`);
              parametersCount++;
            } else {
              if (splitArgsTags[0].has('variable') || splitArgsTags[0].has('color') || splitArgsTags[0].has('length')) {
                parameters.push({
                  type: 'color-stop',
                  parameters: []
                });
                parametersCount++;
                for (let k = 0; k < splitArgsLen; k++) {
                  const splitArgTag = splitArgsTags[k];
                  const splitArg = splitArgs[k];
                  if (splitArgTag.has('variable') || splitArgTag.has('color')) {
                    parameters[parametersCount - 1]?.parameters.push(parseColor(splitArg));
                  } else if (splitArgTag.has('length')) {
                    parameters[parametersCount - 1]?.parameters.push(`${splitArg.value.toString()}${splitArg?.unit || ''}`);
                  }
                }
              }
            }
          } else if (argTags.has('length') || argTags.has('angle')) {
            parameters.push(`${arg.value.toString()}${arg?.unit || ''}`);
            parametersCount++;
          } else if (argTags.has('variable') || argTags.has('color')) {
            parameters.push({
              type: 'color-stop',
              parameters: []
            });
            parametersCount++;
            parameters[parametersCount - 1]?.parameters.push(parseColor(arg));
          }
        }
        const result: LinearGradient = {
          type: 'linear-gradient',
          parameters: parameters
        };
        return result;
        break;
      }

      case 'radial-gradient': {
        const parameters = [];
        let parametersCount = 0;
        const args = object.args;
        for (let i = 0, l = args.length; i < l; i++) {
          const arg = args[i];
          const argTags = getSyntaxTags(arg);
          if (arg.type === 'string') {
            const splitArgs = splitByTopLevelDelimiter(arg.value, [' ']).result;
            const splitArgsTags = [];
            const splitArgsLen = splitArgs.length;
            for (let j = splitArgsLen - 1; j >= 0; j--) {
              const splitArgObject = buildObject(splitArgs[j]);
              splitArgs.splice(j, 1, splitArgObject);
              splitArgsTags.unshift(getSyntaxTags(splitArgObject));
            }

            if (splitArgsLen === 1) {
              if (splitArgsTags[0].has('extent') || splitArgsTags[0].has('shape') || splitArgsTags[0].has('center')) {
                parameters.push(splitArgs[0].value);
                parametersCount++;
              }
            } else if (splitArgsLen === 2 && splitArgsTags[0].has('at') && splitArgsTags[1].has('position') && !splitArgsTags[1].has('extent')) {
              parameters.push(`at ${splitArgs[1].value}${splitArgs[1]?.unit || ''}`);
              parametersCount++;
            } else if (splitArgsLen === 2 && splitArgsTags[0].has('at') && splitArgsTags[1].has('position') && !splitArgsTags[1].has('extent') && splitArgsTags[2].has('position') && !splitArgsTags[2].has('extent')) {
              parameters.push(`at ${splitArgs[1].value}${splitArgs[1]?.unit || ''}`);
              parametersCount++;
            } else if (splitArgsLen === 2 && splitArgsTags[0].has('shape') && splitArgsTags[1].has('extent')) {
              parameters.push(`${splitArgs[0].value} ${splitArgs[1].value}`);
              parametersCount++;
            } else if (splitArgsLen === 3 && splitArgsTags[0].has('shape') && splitArgsTags[1].has('at') && splitArgsTags[2].has('position') && !splitArgsTags[2].has('extent')) {
              parameters.push(`${splitArgs[0].value} ${splitArgs[1].value} ${splitArgs[2].value}${splitArgs[2]?.unit || ''}`);
              parametersCount++;
            } else if (splitArgsLen === 4 && splitArgsTags[0].has('shape') && splitArgsTags[1].has('at') && splitArgsTags[2].has('position') && !splitArgsTags[2].has('extent') && splitArgsTags[3].has('position') && !splitArgsTags[3].has('extent')) {
              parameters.push(`${splitArgs[0].value} at ${splitArgs[2].value}${splitArgs[2]?.unit || ''} ${splitArgs[3].value}${splitArgs[3]?.unit || ''}`);
              parametersCount++;
            }

            if (splitArgsTags[0].has('variable') || splitArgsTags[0].has('color') || splitArgsTags[0].has('length')) {
              parameters.push({
                type: 'color-stop',
                parameters: []
              });
              parametersCount++;
              for (let k = 0; k < splitArgsLen; k++) {
                const splitArgTag = splitArgsTags[k];
                const splitArg = splitArgs[k];
                if (splitArgTag.has('variable') || splitArgTag.has('color')) {
                  parameters[parametersCount - 1]?.parameters.push(parseColor(splitArg));
                } else if (splitArgTag.has('length')) {
                  parameters[parametersCount - 1]?.parameters.push(`${splitArg.value.toString()}${splitArg?.unit || ''}`);
                }
              }
            }
          } else if (argTags.has('length') || argTags.has('angle')) {
            parameters.push(`${arg.value.toString()}${arg?.unit || ''}`);
            parametersCount++;
          } else if (argTags.has('variable')) {
            const parsedArg = parseColor(arg);
            if (parsedArg !== false) {
              parameters.push({
                type: 'color-stop',
                parameters: []
              });
              parametersCount++;
              parameters[parametersCount - 1]?.parameters.push(parsedArg);
            }
          }
        }
        const result: RadialGradient = {
          type: 'radial-gradient',
          parameters: parameters
        };
        return result;
        break;
      }

      case 'conic-gradient': {
        const parameters = [];
        let parametersCount = 0;
        const args = object.args;
        for (let i = 0, l = args.length; i < l; i++) {
          const arg = args[i];
          const argTags = getSyntaxTags(arg);
          if (arg.type === 'string') {
            const splitArgs = splitByTopLevelDelimiter(arg.value, [' ']).result;
            const splitArgsTags = [];
            const splitArgsLen = splitArgs.length;
            for (let j = splitArgsLen - 1; j >= 0; j--) {
              const splitArgObject = buildObject(splitArgs[j]);
              splitArgs.splice(j, 1, splitArgObject);
              splitArgsTags.unshift(getSyntaxTags(splitArgObject));
            }

            if (splitArgsLen === 2 && splitArgsTags[0].has('from') && splitArgsTags[1].has('angle')) {
              parameters.push(`from ${splitArgs[1].value}${splitArgs[1]?.unit || ''}`);
              parametersCount++;
            } else if (splitArgsLen === 4 && splitArgsTags[0].has('from') && splitArgsTags[1].has('angle') && splitArgsTags[2].has('at') && splitArgsTags[3].has('position')) {
              parameters.push(`from ${splitArgs[1].value}${splitArgs[1]?.unit || ''} at ${splitArgs[3].value}${splitArgs[3]?.unit || ''}`);
              parametersCount++;
            } else if (splitArgsLen === 5 && splitArgsTags[0].has('from') && splitArgsTags[1].has('angle') && splitArgsTags[2].has('at') && splitArgsTags[3].has('position') && splitArgsTags[4].has('position')) {
              parameters.push(`from ${splitArgs[1].value}${splitArgs[1]?.unit || ''} at ${splitArgs[3].value}${splitArgs[3]?.unit || ''} ${splitArgs[4].value}${splitArgs[4]?.unit || ''}`);
              parametersCount++;
            } else if (splitArgsLen === 2 && splitArgsTags[0].has('at') && splitArgsTags[1].has('position')) {
              parameters.push(`at ${splitArgs[1].value}${splitArgs[1]?.unit || ''}`);
              parametersCount++;
            } else if (splitArgsLen === 3 && splitArgsTags[0].has('at') && splitArgsTags[1].has('position') && splitArgsTags[2].has('position')) {
              parameters.push(`at ${splitArgs[1].value}${splitArgs[1]?.unit || ''} ${splitArgs[2].value}${splitArgs[2]?.unit || ''}`);
              parametersCount++;
            }
            if (splitArgsTags[0].has('variable') || splitArgsTags[0].has('color') || splitArgsTags[0].has('length')) {
              parameters.push({
                type: 'color-stop',
                parameters: []
              });
              parametersCount++;
              for (let k = 0; k < splitArgsLen; k++) {
                const splitArgTag = splitArgsTags[k];
                const splitArg = splitArgs[k];
                if (splitArgTag.has('variable') || splitArgTag.has('color')) {
                  parameters[parametersCount - 1]?.parameters.push(parseColor(splitArg));
                } else if (splitArgTag.has('angle')) {
                  parameters[parametersCount - 1]?.parameters.push(`${splitArg.value.toString()}${splitArg?.unit || ''}`);
                }
              }
            }
          } else if (argTags.has('angle')) {
            parameters.push(`${arg.value.toString()}${arg?.unit || ''}`);
            parametersCount++;
          } else if (argTags.has('variable')) {
            const parsedArg = parseColor(arg);
            if (parsedArg !== false) {
              parameters.push({
                type: 'color-stop',
                parameters: []
              });
              parametersCount++;
              parameters[parametersCount - 1]?.parameters.push(parsedArg);
            }
          }
        }
        const result: ConicGradient = {
          type: 'conic-gradient',
          parameters: parameters
        };
        return result;
        break;
      }

      default:
        break;
    }
  }

  const result = {
    type: 'rgba',
    rgba: [0, 0, 0, 0]
  };

  return result;
}

function invertGradientColorStops(params: GradientParameterArray, darkened: boolean = false): GradientParameterArray {
  const paramsLen = params.length;
  for (let i = paramsLen - 1; i >= 0; i--) {
    const param = params[i];
    if (typeof param !== 'string') {
      if (param.type === 'color-stop') {
        const subParams = param.parameters;
        const subParamsLen = subParams.length;
        for (let j = subParamsLen - 1; j >= 0; j--) {
          const subParam = subParams[j];
          if (typeof subParam !== 'string') {
            subParams.splice(j, 1, invertColor(subParam), darkened);
          }
        }
      }
      params.splice(i, 1, param);
    }
  }
  return params;
}

/**
 *
 * @param color input color
 * @param darkened if set to true, the returned color will be same or darker than the input
 * @returns
 */

export function invertColor(color: Color, darkened: boolean = false): Color {
  switch (color.type) {
    case 'rgb': {
      if (isColorVibrant(color) > 0) {
        return color;
      }

      const [r, g, b] = color.rgb;

      if (r === 0 && g === 0 && b === 0) {
        if (darkened) return color;
        const result: ColorRGB = {
          type: 'rgb',
          rgb: [255, 255, 255]
        };
        return result;
      }

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);

      const minimumValue = 6 / 85;
      const saturation = (max - min) / max;

      const equalizerBase = Math.sqrt(saturation);
      const equalizer = -0.1 + equalizerBase * 1.1;

      const average = (r + g + b) / 3;
      const R = r * (1 - equalizer) + average * equalizer;
      const G = g * (1 - equalizer) + average * equalizer;
      const B = b * (1 - equalizer) + average * equalizer;

      const equalizedValue = Math.max(R, G, B) / 255;
      const newValue = minimumValue + (1 - minimumValue) * (1 - equalizedValue);

      if (darkened && newValue > equalizedValue) return color;

      const scaler = newValue / equalizedValue;
      const red = clamp(0, Math.round(R * scaler), 255);
      const green = clamp(0, Math.round(G * scaler), 255);
      const blue = clamp(0, Math.round(B * scaler), 255);

      const result: ColorRGB = {
        type: 'rgb',
        rgb: [red, green, blue]
      };

      // color = (r,g,b) where 0 <= r, g, b <= 1
      // scaler = t where 0 < t <= 1
      // newColor = color' = t * color = (tr,tg,tb)

      // value:      v = max(r,g,b)
      //             v' = max(tr,tg,tb) = tv
      // chroma:     c = v - min(r,g,b) = max(r,g,b) - min(r,g,b)
      //             c' = v' - min(tr,tg,tb) = max(tr,tg,tb) - min(tr,tg,tb) = t (max(r,g,b) - min(r,g,b)) = tc
      // saturation: s = 0 [if v = 0], c / v [otherwise]
      //             s' = c' / v' = 0 [if tv = 0], tc / tv [otherwise]
      // hue:        h = 60 * (g - b) / c [if v = r], 60 * (2 + (b - r) / c) [if v = g], 60 * (4 + (r - g) / c) [if v = b]
      //             h' = 60 * (tg - tb) / tc [if tv = tr], 60 * (2 + (tb - tr) / tc) [if tv = tg], 60 * (4 + (tr - tg) / tc) [if tv = tb]
      // h' = h and s' = s and v' = tv
      return result;
      break;
    }

    case 'rgb-v': {
      return color;
      break;
    }

    case 'rgba': {
      const [R, G, B, A] = color.rgba;
      const RGB: ColorRGB = {
        type: 'rgb',
        rgb: [R, G, B]
      };
      const invertedRGB = invertColor(RGB, darkened) as ColorRGB;
      const [r, g, b] = invertedRGB.rgb;
      const result: ColorRGBA = {
        type: 'rgba',
        rgba: [r, g, b, A]
      };
      return result;
      break;
    }

    case 'rgba-v': {
      const [R, G, B, A] = color.parameters;
      if (typeof R === 'number' && typeof G === 'number' && typeof B === 'number') {
        const RGB: ColorRGB = {
          type: 'rgb',
          rgb: [R, G, B]
        };
        const invertedRGB = invertColor(RGB, darkened) as ColorRGB;
        const [r, g, b] = invertedRGB.rgb;
        const result: ColorRGBA_Variable = {
          type: 'rgba-v',
          parameters: [r, g, b, A]
        };
        return result;
      } else {
        return color;
      }
      break;
    }

    case 'hsl-v': {
      return color;
      break;
    }

    case 'hsla-v': {
      return color;
      break;
    }

    case 'variable': {
      for (let i = color.args.length - 1; i >= 0; i--) {
        color.args.splice(i, 1, invertColor(color.args[i], darkened));
      }
      return color;
      break;
    }

    case 'variable-name': {
      return color; // Variable references are not inverted
      break;
    }

    case 'linear-gradient': {
      const invertedColors = invertGradientColorStops(color.parameters, darkened);
      const result: LinearGradient = {
        type: 'linear-gradient',
        direction: color.direction,
        colorStops: invertedColors
      };
      return result;
      break;
    }

    case 'radial-gradient': {
      const invertedColors = invertGradientColorStops(color.colorStops, darkened);
      const result: RadialGradient = {
        type: 'radial-gradient',
        position: color.position,
        shape: color.shape,
        size: color.size,
        colorStops: invertedColors
      };
      return result;
      break;
    }

    case 'conic-gradient': {
      const invertedColors = invertGradientColorStops(color.colorStops, darkened);
      const result: ConicGradient = {
        type: 'conic-gradient',
        angle: color.angle,
        colorStops: invertedColors
      };
      return result;
      break;
    }

    case 'url': {
      return color;
      break;
    }

    case 'keyword': {
      return color;
      break;
    }

    case 'unknown': {
      return color;
      break;
    }

    default: {
      return color; // Fallback for any other types
      break;
    }
  }
}

export function colorToString(color: Color): string {
  switch (color.type) {
    case 'rgb': {
      const [r, g, b] = color.rgb;
      return `rgb(${r},${g},${b})`;
    }

    case 'rgb-v': {
      const components = [];
      for (const parameter of color.parameters) {
        components.push(typeof parameter === 'number' ? parameter : parameter.ref);
      }
      return `rgb(${components.join(',')})`;
    }

    case 'rgba': {
      const [r, g, b, a] = color.rgba;
      return `rgba(${r},${g},${b},${a})`;
    }

    case 'rgba-v': {
      const components = [];
      for (const parameter of color.parameters) {
        components.push(typeof parameter === 'number' ? parameter : parameter.ref);
      }
      return `rgba(${components.join(',')})`;
    }

    case 'hsl-v': {
      const components = [];
      for (const parameter of color.parameters) {
        if (typeof parameter === 'number') {
          components.push(parameter);
        } else if (typeof parameter === 'object') {
          if (parameter.type === 'number-u') {
            components.push(`${parameter.number.toString()}${parameter.unit}`);
          }
          if (parameter.type === 'variable') {
            components.push(parameter.ref);
          }
        }
      }
      return `hsl(${components.join(',')})`;
    }

    case 'hsla-v': {
      const components = [];
      for (const parameter of color.parameters) {
        if (typeof parameter === 'number') {
          components.push(parameter);
        } else if (typeof parameter === 'object') {
          if (parameter.type === 'number-u') {
            components.push(`${parameter.number.toString()}${parameter.unit}`);
          }
          if (parameter.type === 'variable') {
            components.push(parameter.ref);
          }
        }
      }
      return `hsla(${components.join(',')})`;
    }

    case 'variable': {
      const arr: Array<any> = color.args;
      for (let i = arr.length - 1; i >= 0; i--) {
        arr.splice(i, 1, colorToString(arr[i]));
      }
      return `var(${arr.flat(8).join(',')})`;
    }

    case 'variable-name': {
      return color.name;
    }

    case 'linear-gradient': {
      const linearStops = color.colorStops.map((stop) => `${colorToString(stop.color)} ${stop.position}`).join(',');
      return `linear-gradient(${color.direction},${linearStops})`;
    }

    case 'radial-gradient': {
      const radialStops = color.colorStops.map((stop) => `${colorToString(stop.color)} ${stop.position}`).join(',');
      return `radial-gradient(${color.shape} ${color.size} at ${color.position},${radialStops})`;
    }

    case 'conic-gradient': {
      const conicStops = color.colorStops.map((stop) => `${colorToString(stop.color)} ${stop.position}`).join(', ');
      return `conic-gradient(${color.angle},${conicStops})`;
    }

    case 'url': {
      return color.ref;
    }

    case 'keyword': {
      return color.value;
    }

    case 'unknown': {
      return color.value;
    }

    default: {
      return '';
      break;
    }
  }
}

export function isColorDark(color: ColorRGBA): number {
  const p = -0.002315205943 * color.rgba[0] + 0.724916473719 + -0.00518915994 * color.rgba[1] + 1.093306292424 - 0.001444153598 * color.rgba[2] + 0.627977492263;
  const q = clamp(0, p * color.rgba[3], 1);
  // ./data/darkness.csv
  return q;
  // higher number means higher probability
}

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

export function isColorVibrant(color: ColorRGB): number {
  // const p = 0.006339594673 * Math.abs(color.rgb[0] - color.rgb[1]) + 0.1357803475 + 0.006733518277 * Math.abs(color.rgb[1] - color.rgb[2]) + 0.1787805054 + 0.005240646414 * Math.abs(color.rgb[0] - color.rgb[2]) + 0.1162090602;
  // const p = 0.006669426162 * Math.abs(color.rgb[0] - color.rgb[1]) + 0.07742765348 + 0.007073453738 * Math.abs(color.rgb[1] - color.rgb[2]) + 0.1163189972 + 0.005399325815 * Math.abs(color.rgb[0] - color.rgb[2]) + 0.06675079166;
  // const p = 0.006694646769 * Math.abs(color.rgb[0] - color.rgb[1]) + 0.06369476726 + 0.007040201321 * Math.abs(color.rgb[1] - color.rgb[2]) + 0.1045286998 + 0.005413701273 * Math.abs(color.rgb[0] - color.rgb[2]) + 0.05323332153;
  // const q = Math.min(Math.max(p / 3, 0), 1);
  // return q;
  // ./data/vibrancy.csv

  const [r, g, b] = color.rgb;
  const [prg, pgb, pbr] = getPerChannelDifference(r, g, b);

  const [RG_avg, RG_stdev] = mergeStats(baseStats.avg[0], baseStats.stdev[0], baseStats.n, prg, 0, 1);
  const [GB_avg, GB_stdev] = mergeStats(baseStats.avg[1], baseStats.stdev[1], baseStats.n, pgb, 0, 1);
  const [BR_avg, BR_stdev] = mergeStats(baseStats.avg[2], baseStats.stdev[2], baseStats.n, pbr, 0, 1);

  const d = (prg - RG_avg) / RG_stdev;
  const e = (pgb - GB_avg) / GB_stdev;
  const f = (pbr - BR_avg) / BR_stdev;

  return (d + e + f) / 3;
}
