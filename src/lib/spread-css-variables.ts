import { Component, ModelComponent } from './component';
import { CSSColor, CSSGradient, CSSVAR } from './css-model';
import { isPathContinuous } from './is-path-continuous';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';

function getSpreadComponents(variableComponent: ModelComponent<CSSVAR>, variableLibrary, mediaQueryConditionsText: string, selectorText: string): Array<Component> {
  const components = variableComponent.components;
  const componentsLen = components.length;
  let spreadComponents = [];
  for (let i = componentsLen - 1; i >= 0; i--) {
    const component = components[i];
    if (component.type === 'string' && component.string.startsWith('--')) {
      let value = undefined;
      if (mediaQueryConditionsText !== '' && isPathContinuous(variableLengthMap, [mediaQueryConditionsText, selectorText, component.string])) {
        // root > media query > selector > property
        value = variableLibrary[mediaQueryConditionsText][selectorText][component.string];
      } else if (mediaQueryConditionsText !== '' && isPathContinuous(variableLengthMap, [mediaQueryConditionsText, ':root', component.string])) {
        // root > media query > :root > property
        value = variableLibrary[mediaQueryConditionsText][':root'][component.string];
      } else if (isPathContinuous(variableLengthMap, [selectorText, component.string])) {
        // root > selector
        value = variableLibrary[selectorText][component.string];
      } else if (isPathContinuous(variableLengthMap, [':root', component.string])) {
        // root > :root
        value = variableLibrary[':root'][component.string];
      }
      if (value !== undefined) {
        const args = splitByTopLevelDelimiter(value).result;
        const argsLen = args.length;
        for (let j = argsLen - 1; j >= 0; j--) {
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
        break;
      }
    } else if (component.type === 'model' && component.model === 'var') {
      spreadComponents = getSpreadComponents(component, variableLibrary, mediaQueryConditionsText, selectorText);
    } else {
      spreadComponents.unshift(component);
      break;
    }
  }
  return spreadComponents;
}

export function spreadCSSVariables(modelComponent: ModelComponent<CSSColor | CSSGradient>, variableLibrary, mediaQueryConditionsText: string, selectorText: string): ModelComponent<CSSColor | CSSVAR | CSSGradient> {
  const components = modelComponent.components;
  const componentsLen = components.length;
  for (let i = componentsLen - 1; i >= 0; i--) {
    const component = components[i];
    if (component.type === 'model' && component.model === 'var') {
      const spreadComponents = getSpreadComponents(component, variableLibrary, mediaQueryConditionsText, selectorText);
      components.splice(i, 1, ...spreadComponents);
    }
  }
  return modelComponent;
}
