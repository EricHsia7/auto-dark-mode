import { Component, ModelComponent } from './component';
import { CSSColor, CSSGradient, CSSVAR } from './css-model';

function getSpreadCSSVariables(variableComponent: ModelComponent<CSSVAR>, selectorText: string, mediaQueryConditions: Array<string>, variableLibrary, variableLengthMap, usedVariables): Array<Component> {
  const components = variableComponent.components;
  const componentsLen = components.length;
  const mediaQueryConditionsLen = mediaQueryConditions.length;
  const joinedMediaQueryConditions = `@media ${mediaQueryConditions.join(' and ')}`;
  let spreadComponents = [];
  for (let i = componentsLen - 1; i >= 0; i--) {
    const component = components[i];
    if (component.type === 'string' && component.string.startsWith('--')) {
      if (mediaQueryConditionsLen > 0 && variableLengthMap.hasOwnProperty(joinedMediaQueryConditions) && variableLengthMap[joinedMediaQueryConditions].hasOwnProperty(selectorText) && variableLengthMap[joinedMediaQueryConditions][selectorText].hasOwnProperty(component.string)) {
        // root > media query > selector > property
        const variableLen = variableLengthMap[joinedMediaQueryConditions][selectorText][component.string];
        for (let j = variableLen - 1; j >= 0; j--) {
          const prop = `--varlib-${component.string}-${j.toString()}`;
          // const arg = variableLibrary[joinedMediaQueryConditions][selectorText][prop];
          const spreadComponent: ModelComponent<CSSVAR> = {
            type: 'model',
            model: 'var',
            components: [
              {
                type: 'string',
                string: prop
              }
            ]
          };
          spreadComponents.unshift(spreadComponent);
        }
        break;
      } else if (variableLengthMap[joinedMediaQueryConditions].hasOwnProperty(':root') && variableLengthMap[joinedMediaQueryConditions][':root'].hasOwnProperty(component.string)) {
        // root > media query > :root > property
        const variableLen = variableLengthMap[joinedMediaQueryConditions][':root'][component.string];
        for (let j = variableLen - 1; j >= 0; j--) {
          const prop = `--varlib-${component.string}-${j.toString()}`;
          // const arg = variableLibrary[joinedMediaQueryConditions][':root'][prop];
          const spreadComponent: ModelComponent<CSSVAR> = {
            type: 'model',
            model: 'var',
            components: [
              {
                type: 'string',
                string: prop
              }
            ]
          };
          spreadComponents.unshift(spreadComponent);
        }
        break;
      } else if (variableLengthMap.hasOwnProperty(selectorText) && variableLengthMap[selectorText].hasOwnProperty(component.string)) {
        // root > selector
        const variableLen = variableLengthMap[selectorText][component.string];
        for (let j = variableLen - 1; j >= 0; j--) {
          const prop = `--varlib-${component.string}-${j.toString()}`;
          // const arg = variableLibrary[selectorText][prop];
          const spreadComponent: ModelComponent<CSSVAR> = {
            type: 'model',
            model: 'var',
            components: [
              {
                type: 'string',
                string: prop
              }
            ]
          };
          spreadComponents.unshift(spreadComponent);
        }
        break;
      } else if (variableLengthMap.hasOwnProperty(':root') && variableLengthMap[':root'].hasOwnProperty(component.string)) {
        // root > :root
        const variableLen = variableLengthMap[':root'][component.string];
        for (let j = variableLen - 1; j >= 0; j--) {
          const prop = `--varlib-${component.string}-${j.toString()}`;
          // const arg = variableLibrary[':root'][prop];
          const spreadComponent: ModelComponent<CSSVAR> = {
            type: 'model',
            model: 'var',
            components: [
              {
                type: 'string',
                string: prop
              }
            ]
          };
          spreadComponents.unshift(spreadComponent);
        }
        break;
      }
    } else if (component.type === 'model' && component.model === 'var') {
      spreadComponents = getSpreadCSSVariables(component, selectorText, mediaQueryConditions, variableLibrary, variableLengthMap, usedVariables);
    } else {
      spreadComponents.unshift(component);
      break;
    }
  }
  return spreadComponents;
}

export function spreadCSSVariables(modelComponent: ModelComponent<CSSColor | CSSGradient>, selectorText: string, mediaQueryConditions: Array<string>, variableLibrary, variableLengthMap, usedVariables): ModelComponent<CSSColor | CSSVAR | CSSGradient> {
  const components = modelComponent.components;
  const componentsLen = components.length;
  for (let i = componentsLen - 1; i >= 0; i--) {
    const component = components[i];
    if (component.type === 'model' && component.model === 'var') {
      const spread = getSpreadCSSVariables(component, selectorText, mediaQueryConditions, variableLibrary, variableLengthMap, usedVariables);
      components.splice(i, spread.length, ...spread);
    }
  }
  return modelComponent;
}
