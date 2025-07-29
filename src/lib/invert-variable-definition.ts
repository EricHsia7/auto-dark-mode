import { parseComponent } from './component';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';
import { CSSProperties, CSSVariableReferenceMap, StylesCollection, StyleSheet } from './styles';

export function invertVariableDefinition(variableName: string, value: string, referenceMap: CSSVariableReferenceMap, context: StylesCollection | StyleSheet | CSSProperties): string {
  if (!referenceMap.hasOwnProperty(variableName)) return value;
  if (referenceMap[variableName].length === 0) return value;

  const args = splitByTopLevelDelimiter(value);
  const argsLen = args.result.length;
  for (let i = argsLen - 1; i >= 0; i--) {
    const arg = args.result[i];
    const parsedComponent = parseComponent(arg);
    if (parsedComponent !== undefined) {
      if (parsedComponent.type === 'model') {
      }
    }
  }
}
