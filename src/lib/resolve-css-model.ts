import { ModelComponent } from './component';
import { CSSColor, CSSGradient, CSSVAR, isColor, isGradient, isVariable, parseCSSModel } from './css-model';
import { CSSProperties, StylesCollection, StyleSheet } from './styles';

function getVariableValue(
  varName: string,
  context: StylesCollection | StyleSheet | CSSProperties
): string | undefined {
  if (typeof context !== 'object' || context === null) return undefined;
  // Try direct property lookup
  if (context.hasOwnProperty(varName)) {
    return (context as CSSProperties)[varName];
  }
  // If context is a StyleSheet or StylesCollection, search recursively
  for (const key in context) {
    if (typeof context[key] === 'object') {
      const found = getVariableValue(varName, context[key]);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

export function resolveCSSModel(
  modelComponent: ModelComponent<CSSColor | CSSVAR | CSSGradient>,
  context: StylesCollection | StyleSheet | CSSProperties
): ModelComponent<CSSColor | CSSVAR | CSSGradient> {
  // Handle variable
  if (isVariable(modelComponent)) {
    // Usually, the first component is the variable name
    const varNameComponent = modelComponent.components[0];
    if (varNameComponent && varNameComponent.type === 'string') {
      const varName = varNameComponent.string.trim();
      const value = getVariableValue(varName, context);
      if (value !== undefined) {
        const parsed = parseCSSModel(value);
        if (parsed) {
          return resolveCSSModel(parsed, context);
        }
      }
    }
    // If not found, return as-is
    return modelComponent;
  }

  // Handle gradients
  if (isGradient(modelComponent)) {
    const resolvedComponents = modelComponent.components.map((comp) => {
      if (comp.type === 'model' && (isColor(comp) || isVariable(comp) || isGradient(comp))) {
        return resolveCSSModel(comp, context);
      }
      return comp;
    });
    return {
      ...modelComponent,
      components: resolvedComponents
    };
  }

  // Handle color
  if (isColor(modelComponent)) {
    // If color contains variables, resolve them
    const resolvedComponents = modelComponent.components.map((comp) => {
      if (comp.type === 'model' && isVariable(comp)) {
        return resolveCSSModel(comp, context);
      }
      return comp;
    });
    return {
      ...modelComponent,
      components: resolvedComponents
    };
  }

  // Fallback: return as-is
  return modelComponent;
}