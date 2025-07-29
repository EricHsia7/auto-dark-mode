import { ModelComponent } from './component';
import { CSSColor, CSSGradient, CSSVAR, isColor, isGradient, isVariable, parseCSSModel } from './css-model';
import { findPropertyValue } from './find-property-value';
import { CSSProperties, StylesCollection, StyleSheet } from './styles';

export function resolveCSSModel(modelComponent: ModelComponent<CSSColor | CSSVAR | CSSGradient>, initialPath: Array<string>, context: StylesCollection | StyleSheet | CSSProperties): Component | Array<Component> | undefined {
  const components = modelComponent.components;
  const componentsLen = components.length;
  let offset = 0;
  for (let i = componentsLen - 1; i >= 0; i--) {
    const component = components[i];
    if (component.type === 'model') {
      if (isColor(component) || isVariable(component) || isGradient(component)) {
        const resolved = resolveCSSModel(component, initialPath, context);
        if (resolved !== undefined) {
          if (Array.isArray(resolved)) {
            components.splice(i + offset, 1, ...resolved);
            offset += 1 - resolved.length;
          } else {
            components.splice(i + offset, 1, resolved);
          }
        }
      }
    } else if (component.type === 'string' && component.string.startsWith('--')) {
      const value = findPropertyValue(context, component.string, initialPath);
      if (value !== undefined && typeof value === 'string') {
        // parse, resolve, and spread arguments
        components.splice(i + offset, 1);
        const args = splitByTopLevelDelimiter(value);
        for (let j = args.result.length - 1; j >= 0; j--) {
          const arg = args.result[j];
          const parsedArg = parseCSSModel(arg) || parseComponent(arg);
          if (parsedArg !== undefined) {
            if (parsedArg.type === 'model') {
              if (isColor(parsedArg) || isVariable(parsedArg) || isGradient(parsedArg)) {
                const resolved = resolveCSSModel(parsedArg, initialPath, context);
                if (resolved !== undefined) {
                  if (Array.isArray(resolved)) {
                    components.splice(i + offset, 0, ...resolved);
                    offset += 1 - resolved.length;
                  } else {
                    components.splice(i + offset, 0, resolved);
                    offset--;
                  }
                }
              }
            } else {
              components.splice(i + offset, 0, parsedArg);
              offset--;
            }
          }
        }
      } else {
        components.splice(i, 1);
      }
    } else if (component.type === 'string') {
      const parsed = parseCSSModel(component.string);
      if (parsed !== undefined) {
        if (isColor(parsed) || isVariable(parsed) || isGradient(parsed)) {
          const resolved = resolveCSSModel(parsed, initialPath, context);
          if (resolved !== undefined) {
            if (Array.isArray(resolved)) {
              components.splice(i + offset, 1, ...resolved);
              offset += 1 - resolved.length;
            } else {
              components.splice(i + offset, 1, resolved);
            }
          }
        }
      }
    }
  }

  if (components.length === 0) return undefined;

  if (isVariable(modelComponent)) {
    return modelComponent.components;
  }

  return modelComponent;
}
