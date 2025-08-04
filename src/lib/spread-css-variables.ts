import { Component, ModelComponent } from './component';
import { CSSColor, CSSGradient, CSSVAR } from './css-model';
import { isPathContinuous } from './is-path-continuous';

function getSpreadComponents(variableComponent: ModelComponent<CSSVAR>, selectorText: string, mediaQueryConditions: Array<string>, variableLengthMap, usedVariables): Array<Component> {
  console.log(1);
  const components = variableComponent.components;
  const componentsLen = components.length;
  const mediaQueryConditionsLen = mediaQueryConditions.length;
  const joinedMediaQueryConditions = `@media ${mediaQueryConditions.join(' and ')}`;
  let spreadComponents = [];
  console.log(2, components, componentsLen, mediaQueryConditionsLen, joinedMediaQueryConditions);
  for (let i = componentsLen - 1; i >= 0; i--) {
    const component = components[i];
    console.log(3, 'i', i, component);
    if (component.type === 'string' && component.string.startsWith('--')) {
      console.log(4);
      let variableLen = -1;
      if (mediaQueryConditionsLen > 0 && isPathContinuous(variableLengthMap, [joinedMediaQueryConditions, selectorText, component.string])) {
        console.log(5);

        // root > media query > selector > property
        variableLen = variableLengthMap[joinedMediaQueryConditions][selectorText][component.string];
      } else if (mediaQueryConditionsLen > 0 && isPathContinuous(variableLengthMap, [joinedMediaQueryConditions, ':root', component.string])) {
        console.log(6);

        // root > media query > :root > property
        variableLen = variableLengthMap[joinedMediaQueryConditions][':root'][component.string];
      } else if (isPathContinuous(variableLengthMap, [selectorText, component.string])) {
        console.log(7);

        // root > selector
        variableLen = variableLengthMap[selectorText][component.string];
      } else if (isPathContinuous(variableLengthMap, [':root', component.string])) {
        console.log(8);

        // root > :root
        variableLen = variableLengthMap[':root'][component.string];
      }

      console.log(9, variableLen);

      for (let j = variableLen - 1; j >= 0; j--) {
        console.log(10, 'j', j);
        const prop = `--varlib-${component.string}-${j.toString()}`;
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
        console.log(11, spreadComponent);
      }

      if (variableLen !== -1) break;
    } else if (component.type === 'model' && component.model === 'var') {
      console.log(12, component);

      spreadComponents = getSpreadComponents(component, selectorText, mediaQueryConditions, variableLengthMap, usedVariables);
    } else {
      console.log(13, component);

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
      components.splice(i, spreadComponents.length, ...spreadComponents);
    }
  }
  return modelComponent;
}
