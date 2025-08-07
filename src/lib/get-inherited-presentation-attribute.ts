import { generateElementSelector } from './generate-element-selector';
import { isPathContinuous } from './is-path-continuous';
import { isSVGElement } from './svg-elements';

export function getInheritedPresentationAttribute(element: Element, property: string, presentationAttributeMap: object): string | undefined {
  let parent = element.parentElement;
  let depth = 0;
  while (parent && depth < 16) {
    if (isSVGElement(parent.tagName)) {
      const parentSelector = generateElementSelector(parent);
      if (isPathContinuous(presentationAttributeMap, [parentSelector, property])) {
        return presentationAttributeMap[parentSelector][property];
      }
      parent = parent.parentElement;
    } else {
      break;
    }
    depth++;
  }
  return undefined;
}
