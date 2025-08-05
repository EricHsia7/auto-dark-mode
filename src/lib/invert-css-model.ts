import { angleToDegrees } from './angle-to-degree';
import { getColorVibrancyCSSVariable } from './color-vibrancy';
import { ModelComponent, parseComponent, stringifyComponent } from './component';
import { cssPrimaryDelimiters } from './css-delimiters';
import { CSSColor, CSSGradient, CSSRGB, CSSRGBA, CSSVAR, isColor, isVariable, parseCSSModel } from './css-model';
import { isAngle } from './css-units';
import { deepAssign } from './deep-assign';
import { generateIdentifier } from './generate-identifier';
import { getVariableLibraryContext } from './get-variable-library-context';
import { hslToRgb } from './hsl-to-rgb';
import { hwbToRgb } from './hwb-to-rgb';
import { getInvertedRGBCSSVariables, invertRGB } from './invert-rgb';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';
import { spreadCSSVariables } from './spread-css-variables';

export function invertCSSModel(modelComponent: ModelComponent<CSSColor | CSSVAR | CSSGradient>, darkened: boolean, spread: boolean = false, variableLibrary, mediaQueryConditionsText: string, selectorText: string = ''): ModelComponent<CSSColor | CSSVAR | CSSGradient> {
  switch (modelComponent.model) {
    case 'rgb': {
      const [red, green, blue, alpha] = modelComponent.components;

      const areRGBObject = typeof red === 'object' && typeof green === 'object' && typeof blue === 'object';
      const absolute = areRGBObject && red?.type === 'number' && green?.type === 'number' && blue?.type === 'number';

      if (absolute) {
        const [R, G, B] = invertRGB(red.number, green.number, blue.number, darkened);
        if (alpha === undefined) {
          const result: ModelComponent<CSSRGB> = {
            type: 'model',
            model: 'rgb',
            components: [
              { type: 'number', number: R, unit: '' },
              { type: 'number', number: G, unit: '' },
              { type: 'number', number: B, unit: '' }
            ]
          };
          return result;
        } else if (alpha.type === 'number' && alpha.number === 1) {
          const result: ModelComponent<CSSRGB> = {
            type: 'model',
            model: 'rgb',
            components: [
              { type: 'number', number: R, unit: '' },
              { type: 'number', number: G, unit: '' },
              { type: 'number', number: B, unit: '' }
            ]
          };
          return result;
        } else if (alpha.type === 'number' && alpha.unit === '') {
          const result: ModelComponent<CSSRGBA> = {
            type: 'model',
            model: 'rgba',
            components: [{ type: 'number', number: R, unit: '' }, { type: 'number', number: G, unit: '' }, { type: 'number', number: B, unit: '' }, alpha]
          };
          return result;
        } else if (alpha.type === 'model' && alpha.model === 'var') {
          const result: ModelComponent<CSSRGBA> = {
            type: 'model',
            model: 'rgba',
            components: [{ type: 'number', number: R, unit: '' }, { type: 'number', number: G, unit: '' }, { type: 'number', number: B, unit: '' }, alpha]
          };
          return result;
        }
      } else if (spread) {
        const id = generateIdentifier();
        const spreadModelComponent = spreadCSSVariables(modelComponent, variableLibrary, mediaQueryConditionsText, selectorText);
        const [red1, green1, blue1, alpha1] = spreadModelComponent.components;
        console.log(JSON.stringify(spreadModelComponent, null, 2));
        const container = {};
        getColorVibrancyCSSVariable(id, red1, green1, blue1, container);
        const [red2, green2, blue2] = getInvertedRGBCSSVariables(id, red1, green1, blue1, container);
        if (mediaQueryConditionsText === '') {
          if (!variableLibrary.hasOwnProperty(':root')) {
            variableLibrary[':root'] = {};
          }
          variableLibrary[':root'] = deepAssign(variableLibrary[':root'], container);
        } else {
          if (!variableLibrary.hasOwnProperty(mediaQueryConditionsText)) {
            variableLibrary[mediaQueryConditionsText] = {};
          }
          if (!variableLibrary[mediaQueryConditionsText].hasOwnProperty(':root')) {
            variableLibrary[mediaQueryConditionsText][':root'] = {};
          }
          variableLibrary[mediaQueryConditionsText][':root'] = deepAssign(variableLibrary[mediaQueryConditionsText][':root'], container);
        }
        console.log(JSON.stringify(container, null, 2));
        if (alpha === undefined) {
          const result: ModelComponent<CSSRGB> = {
            type: 'model',
            model: 'rgb',
            components: [red2, green2, blue2]
          };
          return result;
        } else {
          const result: ModelComponent<CSSRGBA> = {
            type: 'model',
            model: 'rgba',
            components: [red2, green2, blue2, alpha1]
          };
          return result;
        }
      } else {
        return modelComponent;
      }
      break;
    }

    case 'rgba': {
      const [red, green, blue, alpha] = modelComponent.components;

      const areRGBAObject = typeof red === 'object' && typeof green === 'object' && typeof blue === 'object' && typeof alpha === 'object';
      const absolute = areRGBAObject && red?.type === 'number' && green?.type === 'number' && blue?.type === 'number';

      if (absolute) {
        const [R, G, B] = invertRGB(red.number, green.number, blue.number, darkened);

        if (alpha.type === 'number' && alpha.number === 1) {
          const result: ModelComponent<CSSRGB> = {
            type: 'model',
            model: 'rgb',
            components: [
              { type: 'number', number: R, unit: '' },
              { type: 'number', number: G, unit: '' },
              { type: 'number', number: B, unit: '' }
            ]
          };
          return result;
        } else if (alpha.type === 'number' && alpha.unit === '') {
          const result: ModelComponent<CSSRGBA> = {
            type: 'model',
            model: 'rgba',
            components: [{ type: 'number', number: R, unit: '' }, { type: 'number', number: G, unit: '' }, { type: 'number', number: B, unit: '' }, alpha]
          };
          return result;
        } else if (alpha.type === 'model' && alpha.model === 'var') {
          const result: ModelComponent<CSSRGBA> = {
            type: 'model',
            model: 'rgba',
            components: [{ type: 'number', number: R, unit: '' }, { type: 'number', number: G, unit: '' }, { type: 'number', number: B, unit: '' }, alpha]
          };
          return result;
        }
      } else if (spread) {
        console.log(spreadCSSVariables(modelComponent, variableLibrary, mediaQueryConditionsText, selectorText));
        return modelComponent;
      } else {
        return modelComponent;
      }
      break;
    }

    case 'hsl': {
      const [hue, saturation, lightness, alpha] = modelComponent.components;

      const areHSLObject = typeof hue === 'object' && typeof saturation === 'object' && typeof lightness === 'object';
      const areHSLNumber = areHSLObject && hue?.type === 'number' && saturation?.type === 'number' && lightness?.type === 'number';
      const absolute = areHSLNumber && hue.unit === '' && saturation.unit === '%' && lightness.unit === '%';

      if (absolute) {
        const [R, G, B] = hslToRgb(hue.number, saturation.number / 100, lightness.number / 100);
        const [R1, G1, B1] = invertRGB(R, G, B, darkened);

        if (alpha === undefined) {
          const result: ModelComponent<CSSRGB> = {
            type: 'model',
            model: 'rgb',
            components: [
              { type: 'number', number: R1, unit: '' },
              { type: 'number', number: G1, unit: '' },
              { type: 'number', number: B1, unit: '' }
            ]
          };
          return result;
        } else if (alpha.type === 'number' && alpha.number === 1) {
          const result: ModelComponent<CSSRGB> = {
            type: 'model',
            model: 'rgb',
            components: [
              { type: 'number', number: R1, unit: '' },
              { type: 'number', number: G1, unit: '' },
              { type: 'number', number: B1, unit: '' }
            ]
          };
          return result;
        } else if (alpha.type === 'number') {
          const result: ModelComponent<CSSRGBA> = {
            type: 'model',
            model: 'rgba',
            components: [{ type: 'number', number: R, unit: '' }, { type: 'number', number: G, unit: '' }, { type: 'number', number: B, unit: '' }, alpha]
          };
          return result;
        } else if (alpha.type === 'model' && alpha.model === 'var') {
          const result: ModelComponent<CSSRGBA> = {
            type: 'model',
            model: 'rgba',
            components: [{ type: 'number', number: R, unit: '' }, { type: 'number', number: G, unit: '' }, { type: 'number', number: B, unit: '' }, alpha]
          };
          return result;
        }
      } else if (spread) {
        console.log(spreadCSSVariables(modelComponent, variableLibrary, mediaQueryConditionsText, selectorText));
        return modelComponent;
      } else {
        return modelComponent;
      }
      break;
    }

    case 'hsla': {
      const [hue, saturation, lightness, alpha] = modelComponent.components;

      const areHSLAObject = typeof hue === 'object' && typeof saturation === 'object' && typeof lightness === 'object' && typeof alpha === 'object';
      const areHSLNumber = areHSLAObject && hue.type === 'number' && saturation.type === 'number' && lightness.type === 'number';
      const absolute = areHSLNumber && hue.unit === '' && saturation.unit === '%' && lightness.unit === '%';

      if (absolute) {
        const [R, G, B] = hslToRgb(hue.number, saturation.number / 100, lightness.number / 100);
        const [R1, G1, B1] = invertRGB(R, G, B, darkened);

        if (alpha.type === 'number' && alpha.number === 1) {
          const result: ModelComponent<CSSRGB> = {
            type: 'model',
            model: 'rgb',
            components: [
              { type: 'number', number: R1, unit: '' },
              { type: 'number', number: G1, unit: '' },
              { type: 'number', number: B1, unit: '' }
            ]
          };
          return result;
        } else if (alpha.type === 'number') {
          const result: ModelComponent<CSSRGBA> = {
            type: 'model',
            model: 'rgba',
            components: [{ type: 'number', number: R, unit: '' }, { type: 'number', number: G, unit: '' }, { type: 'number', number: B, unit: '' }, alpha]
          };
          return result;
        } else if (alpha.type === 'model' && alpha.model === 'var') {
          const result: ModelComponent<CSSRGBA> = {
            type: 'model',
            model: 'rgba',
            components: [{ type: 'number', number: R, unit: '' }, { type: 'number', number: G, unit: '' }, { type: 'number', number: B, unit: '' }, alpha]
          };
          return result;
        }
      } else if (spread) {
        console.log(spreadCSSVariables(modelComponent, variableLibrary, mediaQueryConditionsText, selectorText));
        return modelComponent;
      } else {
        return modelComponent;
      }
      break;
    }

    case 'hwb': {
      const [hue, white, black, alpha] = modelComponent.components;

      const areHWBObject = typeof hue === 'object' && typeof black === 'object' && typeof white === 'object';
      const areHWBNumber = areHWBObject && hue.type === 'number' && white.type === 'number' && black.type === 'number';
      const isHueAngle = areHWBNumber && isAngle(hue);
      const isWhitePercentage = areHWBNumber && (white.unit !== '' || white.unit !== '%');
      const isBlackPercentage = areHWBNumber && (black.unit !== '' || black.unit !== '%');
      const absolute = isHueAngle && isWhitePercentage && isBlackPercentage;

      if (absolute) {
        const [R, G, B] = hwbToRgb(angleToDegrees(hue.number), white.number / 100, black.number / 100);
        const [R1, G1, B1] = invertRGB(R, G, B, darkened);

        if (alpha === undefined) {
          const result: ModelComponent<CSSRGB> = {
            type: 'model',
            model: 'rgb',
            components: [
              { type: 'number', number: R1, unit: '' },
              { type: 'number', number: G1, unit: '' },
              { type: 'number', number: B1, unit: '' }
            ]
          };
          return result;
        } else if (alpha.type === 'number' && alpha.number === 1) {
          const result: ModelComponent<CSSRGB> = {
            type: 'model',
            model: 'rgb',
            components: [
              { type: 'number', number: R1, unit: '' },
              { type: 'number', number: G1, unit: '' },
              { type: 'number', number: B1, unit: '' }
            ]
          };
          return result;
        } else if (alpha.type === 'number') {
          const result: ModelComponent<CSSRGBA> = {
            type: 'model',
            model: 'rgba',
            components: [{ type: 'number', number: R1, unit: '' }, { type: 'number', number: G1, unit: '' }, { type: 'number', number: B1, unit: '' }, alpha]
          };
          return result;
        } else if (alpha.type === 'model' && alpha.model === 'var') {
          const result: ModelComponent<CSSRGBA> = {
            type: 'model',
            model: 'rgba',
            components: [{ type: 'number', number: R1, unit: '' }, { type: 'number', number: G1, unit: '' }, { type: 'number', number: B1, unit: '' }, alpha]
          };
          return result;
        }
      } else if (spread) {
        console.log(spreadCSSVariables(modelComponent, variableLibrary, mediaQueryConditionsText, selectorText));
        return modelComponent;
      } else {
        return modelComponent;
      }
    }

    case 'var': {
      const components = modelComponent.components;
      const componentsLen = components.length;
      for (let i = componentsLen - 1; i >= 0; i--) {
        const component = components[i];
        if (component.type === 'model') {
          if (isColor(component) || isVariable(component)) {
            const inverted = invertCSSModel(component, darkened, spread, variableLibrary, mediaQueryConditionsText, selectorText);
            components.splice(i, 1, inverted);
          }
        } else if (component.type === 'string') {
          const parsed = parseCSSModel(component.string);
          if (parsed !== undefined) {
            if (isColor(parsed) || isVariable(parsed)) {
              const inverted = invertCSSModel(parsed, darkened, spread, variableLibrary, mediaQueryConditionsText, selectorText);
              components.splice(i, 1, inverted);
            }
          }
        }
      }
      return modelComponent;
    }

    case 'linear-gradient': {
      const components = modelComponent.components;
      const componentsLen = components.length;

      if (componentsLen === 0) return modelComponent;

      for (let i = componentsLen - 1; i >= 0; i--) {
        const component = components[i];
        if (component.type === 'string') {
          // component is a direction or a group of unparseed components considered a color stop

          if (/^to\s+(top|left|right|bottom)/i.test(component.string)) continue; // keep it as-is

          const splitString = splitByTopLevelDelimiter(component.string, [' ']).result;
          const subComponents = splitString.map((e) => parseCSSModel(e) || parseComponent(e)).filter((e) => e !== undefined);
          const subComponentsLen = subComponents.length;
          for (let j = subComponentsLen - 1; j >= 0; j--) {
            const subComponent = subComponents[j];
            if (subComponent.type === 'model') {
              if (isColor(subComponent) || isVariable(subComponent)) {
                const inverted = invertCSSModel(subComponent, darkened, spread, variableLibrary, mediaQueryConditionsText, selectorText);
                subComponents.splice(j, 1, inverted);
              }
            }
          }
          components.splice(i, 1, { type: 'string', string: subComponents.map((e) => stringifyComponent(e, cssPrimaryDelimiters)).join(' ') });
        } else if (component.type === 'number') {
          // component is a direction (ex: 45deg) or position alone (might appear in color hint syntax)
          // keep it as-is
        } else if (component.type === 'model') {
          // component is a color alone
          if (isColor(component) || isVariable(component)) {
            const inverted = invertCSSModel(component, darkened, spread, variableLibrary, mediaQueryConditionsText, selectorText);
            components.splice(i, 1, inverted);
          }
        }
      }
      return modelComponent;
    }

    case 'radial-gradient': {
      const components = modelComponent.components;
      const componentsLen = components.length;

      if (componentsLen === 0) return modelComponent;

      for (let i = componentsLen - 1; i >= 0; i--) {
        const component = components[i];
        if (component.type === 'string') {
          // component is a shape, size, or a group of unparseed components considered a color stop
          if (/^(circle|ellipse|center)?\s*((at\s*(top|left|right|bottom|center|[\+\-0-9\.]+[a-z%]+|0)\s*(top|left|right|bottom|center|[\+\-0-9\.]+[a-z%]+|0)?)|closest-side|closest-corner|farthest-side|farthest-corner)?$/i.test(component.string)) continue; // keep it as-is

          const splitString = splitByTopLevelDelimiter(component.string, [' ']).result;
          const subComponents = splitString.map((e) => parseCSSModel(e) || parseComponent(e)).filter((e) => e !== undefined);
          const subComponentsLen = subComponents.length;
          for (let j = subComponentsLen - 1; j >= 0; j--) {
            const subComponent = subComponents[j];
            if (subComponent.type === 'model') {
              if (isColor(subComponent) || isVariable(subComponent)) {
                const inverted = invertCSSModel(subComponent, darkened, spread, variableLibrary, mediaQueryConditionsText, selectorText);
                subComponents.splice(j, 1, inverted);
              }
            }
          }

          components.splice(i, 1, { type: 'string', string: subComponents.map((e) => stringifyComponent(e, cssPrimaryDelimiters)).join(' ') });
        } else if (component.type === 'number') {
          // component is a direction (ex: 45deg) or position alone (might appear in color hint syntax)
          // keep it as-is
        } else if (component.type === 'model') {
          // component is a color alone
          if (isColor(component) || isVariable(component)) {
            const inverted = invertCSSModel(component, darkened, spread, variableLibrary, mediaQueryConditionsText, selectorText);
            components.splice(i, 1, inverted);
          }
        }
      }
      return modelComponent;
    }

    case 'conic-gradient': {
      const components = modelComponent.components;
      const componentsLen = components.length;

      if (componentsLen === 0) return modelComponent;

      for (let i = componentsLen - 1; i >= 0; i--) {
        const component = components[i];
        if (component.type === 'string') {
          // component is a starting angle, position, or a group of unparseed components considered a color stop
          if (/^(from ([\+\-0-9\.]+(deg|rad|grad|turn)|0))?\s*(at\s*(top|left|right|bottom|center|[\+\-0-9\.]+[a-z%]+|0)\s*(top|left|right|bottom|center|[\+\-0-9\.]+[a-z%]+|0)?)?$/i.test(component.string)) continue; // keep it as-is

          const splitString = splitByTopLevelDelimiter(component.string, [' ']).result;
          const subComponents = splitString.map((e) => parseCSSModel(e) || parseComponent(e)).filter((e) => e !== undefined);
          const subComponentsLen = subComponents.length;
          for (let j = subComponentsLen - 1; j >= 0; j--) {
            const subComponent = subComponents[j];
            if (subComponent.type === 'model') {
              if (isColor(subComponent) || isVariable(subComponent)) {
                const inverted = invertCSSModel(subComponent, darkened, spread, variableLibrary, mediaQueryConditionsText, selectorText);
                subComponents.splice(j, 1, inverted);
              }
            }
          }

          components.splice(i, 1, { type: 'string', string: subComponents.map((e) => stringifyComponent(e, cssPrimaryDelimiters)).join(' ') });
        } else if (component.type === 'number') {
          // component is a direction (ex: 45deg) or position alone (might appear in color hint syntax)
          // keep it as-is
        } else if (component.type === 'model') {
          // component is a color alone
          if (isColor(component) || isVariable(component)) {
            const inverted = invertCSSModel(component, darkened, spread, variableLibrary, mediaQueryConditionsText, selectorText);
            components.splice(i, 1, inverted);
          }
        }
      }
      return modelComponent;
    }

    default:
      break;
  }

  const fallbackResult: ModelComponent<CSSRGBA> = {
    type: 'model',
    model: 'rgba',
    components: [
      { type: 'number', number: 0, unit: '' },
      { type: 'number', number: 0, unit: '' },
      { type: 'number', number: 0, unit: '' },
      { type: 'number', number: 0, unit: '' }
    ]
  };
  return fallbackResult;
}
