import { generateIdentifier } from './generate-identifier';

export interface ExcludedElement {
  tagName: string;
  id: string;
}

export type ExclusionList = {
  [id: ExcludedElement['id']]: ExcludedElement;
};

const exclusionList: ExclusionList = {};

export function registerExcludedElement(element: HTMLElement): ExcludedElement | false {
  const autoDarkModeExclusion = element.getAttribute('auto-dark-mode-exclusion');
  if (autoDarkModeExclusion) {
    if (exclusionList.hasOwnProperty(autoDarkModeExclusion)) {
      return false;
    }
  } else {
    const newAutoDarkModeExclusion = `_${generateIdentifier()}`;
    element.setAttribute('auto-dark-mode-exclusion', newAutoDarkModeExclusion);
    const result: ExcludedElement = {
      tagName: element.tagName.toLowerCase(),
      id: newAutoDarkModeExclusion
    };
    exclusionList[newAutoDarkModeExclusion] = result;
    return result;
  }
}

export function isElementExcluded(element: HTMLElement): boolean {
  const autoDarkModeExclusion = element.getAttribute('auto-dark-mode-exclusion');
  if (autoDarkModeExclusion) {
    if (exclusionList.hasOwnProperty(autoDarkModeExclusion)) {
      if (element.tagName.toLowerCase() === exclusionList[autoDarkModeExclusion].tagName) {
        return true;
      }
    }
  }
  return false;
}
