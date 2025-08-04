import { Component, ModelComponent, parseComponent } from './component';
import { CSSColor, CSSGradient, CSSVAR, isColor, isGradient, isVariable, parseCSSModel } from './css-model';
import { isPathContinuous } from './is-path-continuous';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';

function getSpreadComponents(variableComponent: ModelComponent<CSSVAR>, variableLibrary, mediaQueryConditionsText: string, selectorText: string): Array<Component> {
  const components = variableComponent.components;
  const componentsLen = components.length;
  let spreadComponents = [];
  for (let i = componentsLen - 1; i >= 0; i--) {
    const component = components[i];
    if (component.type === 'string' && component.string.startsWith('--')) {
      // spread referenced variable
      let value = undefined;
      if (mediaQueryConditionsText !== '' && isPathContinuous(variableLibrary, [mediaQueryConditionsText, selectorText, component.string])) {
        // root > media query > selector > property
        value = variableLibrary[mediaQueryConditionsText][selectorText][component.string];
      } else if (mediaQueryConditionsText !== '' && isPathContinuous(variableLibrary, [mediaQueryConditionsText, ':root', component.string])) {
        // root > media query > :root > property
        value = variableLibrary[mediaQueryConditionsText][':root'][component.string];
      } else if (isPathContinuous(variableLibrary, [selectorText, component.string])) {
        // root > selector
        value = variableLibrary[selectorText][component.string];
      } else if (isPathContinuous(variableLibrary, [':root', component.string])) {
        // root > :root
        value = variableLibrary[':root'][component.string];
      }
      if (value !== undefined) {
        const args = splitByTopLevelDelimiter(value).result;
        const argsLen = args.length;
        for (let j = argsLen - 1; j >= 0; j--) {
          const arg = args[j];
          const parsed = parseCSSModel(arg) || parseComponent(arg);
          if (parsed !== undefined) {
            if (parsed.type === 'model') {
              // spread variables in intermediate models
              if (isColor(parsed) || isGradient(parsed)) {
                spreadComponents.unshift(spreadCSSVariables(parsed, variableLibrary, mediaQueryConditionsText, selectorText));
              } else if (isVariable(parsed)) {
                spreadComponents.unshift.apply(spreadComponents, getSpreadComponents(parsed, variableLibrary, mediaQueryConditionsText, selectorText));
              }
            } else {
              const property = `--varlib-${component.string}-${j.toString()}`;
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
          }
        }
        break;
      }
    } else if (component.type === 'string') {
      // spread the alternative argument list in a variable
      const args = splitByTopLevelDelimiter(component.string).result;
      const argsLen = args.length;
      for (let j = argsLen - 1; j >= 0; j--) {
        const arg = args[j];
        const parsed = parseCSSModel(arg) || parseComponent(arg);
        if (parsed !== undefined) {
          if (parsed.type === 'model') {
            // spread variables in intermediate models
            if (isColor(parsed) || isGradient(parsed)) {
              spreadComponents.unshift(spreadCSSVariables(parsed, variableLibrary, mediaQueryConditionsText, selectorText));
            } else if (isVariable(parsed)) {
              spreadComponents.unshift.apply(spreadComponents, getSpreadComponents(parsed, variableLibrary, mediaQueryConditionsText, selectorText));
            }
          } else {
            spreadComponents.unshift(parsed);
          }
        }
      }
      break;
    } else if (component.type === 'model' && component.model === 'var') {
      // spread variable in a variable
      spreadComponents = getSpreadComponents(component, variableLibrary, mediaQueryConditionsText, selectorText);
    } else {
      // keep other components
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
