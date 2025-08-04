import { ModelComponent } from './component';
import { CSSColor, CSSGradient, CSSVAR } from './css-model';

export function spreadCSSVariables(modelComponent: ModelComponent<CSSColor | CSSVAR | CSSGradient>, selectorText: string, mediaQueryConditions: Array<string>, variableLibrary, variableLengthMap, usedVariables): ModelComponent<CSSColor | CSSVAR | CSSGradient> {
  const components = modelComponent.components;
  const componentsLen = components.length;
  const mediaQueryConditionsLen = mediaQueryConditions.length;
  const joinedMediaQueryConditions = `@media ${mediaQueryConditions.join(' and ')}`;

  for (let i = componentsLen - 1; i >= 0; i--) {
    const component = components[i];
    if (component.type === 'string' && component.string.startsWith('--')) {
      if (mediaQueryConditionsLen > 0 && variableLengthMap.hasOwnProperty(joinedMediaQueryConditions)) {
         if (variableLengthMap[joinedMediaQueryConditions].hasOwnProperty(selectorText)) {
          const variableLen = variableLengthMap[joinedMediaQueryConditions][component.string];
          for (let j = variableLen - 1; j >= 0; j--) {
            const arg = variableLibrary[joinedMediaQueryConditions][selectorText][`--varlib-${component.string}-${j.toString()}`]

          }
        }
        if (variableLengthMap[joinedMediaQueryConditions].hasOwnProperty(component.string)) {
          const variableLen = variableLengthMap[joinedMediaQueryConditions][component.string];
          for (let j = variableLen - 1; j >= 0; j--) {
            const arg = variableLibrary[joinedMediaQueryConditions][selectorText][`--varlib-${component.string}-${j.toString()}`]

          }
        }
      }
    }
  }
}
