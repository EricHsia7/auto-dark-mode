import { parseComponent } from './component';
import { splitByTopLevelDelimiter } from './split-by-top-level-delimiter';
import { CSSVariableReferenceMap } from './styles';

export function invertVariableDefinition(variableName: string, value: string, referenceMap: CSSVariableReferenceMap): string {
  const args = splitByTopLevelDelimiter(value);
  const argsLen = args.result.length;
  for (let i = argsLen - 1; i >= 0; i--) {
    const arg = args.result[i];
    const parsedComponent = parseComponent(arg);
    if(parsedComponent !== undefined) {
if(parsedComponent.type === "model") {

}
    }
  }
}
