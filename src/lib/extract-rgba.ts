import { ModelComponent } from './component';
import { CSSColor, CSSGradient, CSSVAR } from './css-model';

export function extractRGBA(modelComponent: ModelComponent<CSSColor | CSSVAR | CSSGradient>): [red: number, green: number, blue: number, alpha: number] | undefined {
switch (modelComponent.model) {
  case "":
    
    break;

  default:
    break;
}
}
