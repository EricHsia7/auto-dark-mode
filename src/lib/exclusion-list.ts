import { generateIdentifier } from './generate-identifier';

export interface ExcludedStyleTag {
  type: 'style-tag';
  id: string;
}

export type ExclusionList = {
  [id: ExcludedStyleTag['id']]: ExcludedStyleTag;
};

const exclusionList: ExclusionList = {};

export function registerExcludedStyleTag(element: HTMLElement): ExcludedStyleTag | false {
  const autoDarkModeExclusion = element.getAttribute('auto-dark-mode-exclusion');
  if (autoDarkModeExclusion) {
    if (exclusionList.hasOwnProperty(autoDarkModeExclusion)) {
      return false;
    }
  } else {
    const newAutoDarkModeExclusion = `_${generateIdentifier()}`;
    element.setAttribute('auto-dark-mode-exclusion', newAutoDarkModeExclusion);
    const result: ExcludedStyleTag = {
      type: 'style-tag',
      id: newAutoDarkModeExclusion
    };
    exclusionList[newAutoDarkModeExclusion] = result;
    return result;
  }
}
