import { ModelComponent } from './component';
import { CSSColor, CSSGradient, CSSVAR, isColor, isGradient, isVariable, parseCSSModel } from './css-model';
import { findPropertyValue } from './find-property-value';
import { CSSProperties, StylesCollection, StyleSheet } from './styles';

export function resolveCSSModel(modelComponent: ModelComponent<CSSColor | CSSVAR | CSSGradient>, initialPath: Array<string>, context: StylesCollection | StyleSheet | CSSProperties): Component | undefined {
  const components = modelComponent.components;
  const componentsLen = components.length;
  for (let i = componentsLen - 1; i >= 0; i--) {
    const component = components[i];
    if (component.type === 'model') {
      if (isColor(component) || isVariable(component) || isGradient(component)) {
        const resolved = resolveCSSModel(component, initialPath, context);
        if (resolved !== undefined) {
          components.splice(i, 1, resolved);
        }
      }
    } else if (component.type === 'string' && component.string.startsWith('--')) {
      const value = findPropertyValue(context, component.string, initialPath);
      if (value !== undefined && typeof value === 'string') {
        components.splice(i, 1, {
          type: 'string',
          string: value
        });
      } else {
        components.splice(i, 1);
      }
    } else if (component.type === 'string') {
      const parsed = parseCSSModel(component.string);
      if (parsed !== undefined) {
        if (isColor(parsed) || isVariable(parsed) || isGradient(parsed)) {
          const resolved = resolveCSSModel(parsed, initialPath, context);
          if (resolved !== undefined) {
            components.splice(i, 1, resolved);
          }
        }
      }
    }
  }

  if (components.length === 0) return undefined;

  if (isVariable(modelComponent)) {
    return modelComponent.components[0];
  }

  return modelComponent;
}
