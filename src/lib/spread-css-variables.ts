import { Component, ModelComponent, parseComponent } from './component';
import { CSSColor, CSSGradient, CSSVAR, isColor, isGradient, isVariable, parseCSSModel } from './css-model';
import { isPathContinuous } from './is-path-continuous';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';

function getSpreadComponents(variableComponent: ModelComponent<CSSVAR>, variableLibrary, mediaQueryConditionsText: string, selectorText: string): Array<Component> {
  const components = variableComponent.components;
  const componentsLen = components.length;
  let spreadComponents = [];
  for (let i = 0, l = componentsLen; i < l; i++) {
    const component = components[i];
    if (component.type === 'string' && component.string.startsWith('--')) {
      // spread referenced variable
      let context = undefined;
      if (mediaQueryConditionsText !== '' && isPathContinuous(variableLibrary, [mediaQueryConditionsText, selectorText, component.string])) {
        // root > media query > selector > property
        context = variableLibrary[mediaQueryConditionsText][selectorText];
      } else if (mediaQueryConditionsText !== '' && isPathContinuous(variableLibrary, [mediaQueryConditionsText, ':root', component.string])) {
        // root > media query > :root > property
        context = variableLibrary[mediaQueryConditionsText][':root'];
      } else if (isPathContinuous(variableLibrary, [selectorText, component.string])) {
        // root > selector
        context = variableLibrary[selectorText];
      } else if (isPathContinuous(variableLibrary, [':root', component.string])) {
        // root > :root
        context = variableLibrary[':root'];
      }
      if (context !== undefined) {
        const value = context[component.string];
        const args = splitByTopLevelDelimiter(value).result;
        const argsLen = args.length;
        for (let j = 0, m = argsLen; j < m; j++) {
          const arg = args[j];
          const parsed = parseCSSModel(arg) || parseComponent(arg);
          if (parsed !== undefined) {
            if (parsed.type === 'model') {
              // spread variables in intermediate models
              if (isColor(parsed) || isGradient(parsed)) {
                spreadComponents.push(spreadCSSVariables(parsed, variableLibrary, mediaQueryConditionsText, selectorText));
              } else if (isVariable(parsed)) {
                spreadComponents.push.apply(spreadComponents, getSpreadComponents(parsed, variableLibrary, mediaQueryConditionsText, selectorText));
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
              spreadComponents.push(spreadComponent);
              context[property] = arg;
            }
          }
        }
        break;
      }
    } else if (component.type === 'string') {
      // spread the alternative argument list in a variable
      const args = splitByTopLevelDelimiter(component.string).result;
      const argsLen = args.length;
      for (let j = 0, m = argsLen; j < m; j++) {
        const arg = args[j];
        const parsed = parseCSSModel(arg) || parseComponent(arg);
        if (parsed !== undefined) {
          if (parsed.type === 'model') {
            // spread variables in intermediate models
            if (isColor(parsed) || isGradient(parsed)) {
              spreadComponents.push(spreadCSSVariables(parsed, variableLibrary, mediaQueryConditionsText, selectorText));
            } else if (isVariable(parsed)) {
              spreadComponents.push.apply(spreadComponents, getSpreadComponents(parsed, variableLibrary, mediaQueryConditionsText, selectorText));
            } else if (isCalc(parsed)) {
              spreadComponents.push(parsed);
            }
          } else {
            spreadComponents.push(parsed);
          }
        }
      }
      break;
    } else if (component.type === 'model' && component.model === 'var') {
      // spread variable in a variable
      spreadComponents = getSpreadComponents(component, variableLibrary, mediaQueryConditionsText, selectorText);
    } else {
      // keep other components
      spreadComponents.push(component);
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
