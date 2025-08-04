import { Component, ModelComponent } from './component';
import { CSSColor, CSSGradient, CSSVAR } from './css-model';
import { isPathContinuous } from './is-path-continuous';

function getSpreadComponents(variableComponent: ModelComponent<CSSVAR>, selectorText: string, mediaQueryConditions: Array<string>, variableLengthMap, usedVariables): Array<Component> {
  const components = variableComponent.components;
  const componentsLen = components.length;
  const mediaQueryConditionsLen = mediaQueryConditions.length;
  const joinedMediaQueryConditions = `@media ${mediaQueryConditions.join(' and ')}`;
  let spreadComponents = [];
  for (let i = componentsLen - 1; i >= 0; i--) {
    const component = components[i];
    if (component.type === 'string' && component.string.startsWith('--')) {
      let variableLen = -1;
      if (mediaQueryConditionsLen > 0 && isPathContinuous(variableLengthMap, [joinedMediaQueryConditions, selectorText, component.string])) {
        // root > media query > selector > property
        variableLen = variableLengthMap[joinedMediaQueryConditions][selectorText][component.string];
      } else if (mediaQueryConditionsLen > 0 && isPathContinuous(variableLengthMap, [joinedMediaQueryConditions, ':root', component.string])) {
        // root > media query > :root > property
        variableLen = variableLengthMap[joinedMediaQueryConditions][':root'][component.string];
      } else if (isPathContinuous(variableLengthMap, [selectorText, component.string])) {
        // root > selector
        variableLen = variableLengthMap[selectorText][component.string];
      } else if (isPathContinuous(variableLengthMap, [':root', component.string])) {
        // root > :root
        variableLen = variableLengthMap[':root'][component.string];
      }

      for (let j = variableLen - 1; j >= 0; j--) {
        const property = `--varlib-${component.string}-${j.toString()}`;
        // TODO: check sub property length
        const spreadComponent: ModelComponent<CSSVAR> = {
          type: 'model',
          model: 'var',
          components: [
            {
              type: 'string',
              string: property
            }
          ]
        };
        spreadComponents.unshift(spreadComponent);
      }

      if (variableLen !== -1) break;
    } else if (component.type === 'model' && component.model === 'var') {
      spreadComponents = getSpreadComponents(component, selectorText, mediaQueryConditions, variableLengthMap, usedVariables);
    } else {
      spreadComponents.unshift(component);
      break;
    }
  }
  return spreadComponents;
}

export function spreadCSSVariables(modelComponent: ModelComponent<CSSColor | CSSGradient>, selectorText: string, mediaQueryConditions: Array<string>, variableLengthMap, usedVariables): ModelComponent<CSSColor | CSSVAR | CSSGradient> {
  const components = modelComponent.components;
  const componentsLen = components.length;
  for (let i = componentsLen - 1; i >= 0; i--) {
    const component = components[i];
    if (component.type === 'model' && component.model === 'var') {
      const spreadComponents = getSpreadComponents(component, selectorText, mediaQueryConditions, variableLengthMap, usedVariables);
      components.splice(i, 1, ...spreadComponents);
    }
  }
  return modelComponent;
}
