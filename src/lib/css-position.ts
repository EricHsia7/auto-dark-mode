import { Component, StringComponent } from './component';
import { isPercentage } from './css-units';

export type CSSPrepositionFrom = 'from';
export type CSSPrepositionTo = 'to';
export type CSSPrepositionAt = 'at';

export type CSSPreposition = CSSPrepositionFrom | CSSPrepositionTo | CSSPrepositionAt;

export type CSSPositionTop = 'top';
export type CSSPositionLeft = 'left';
export type CSSPositionBottom = 'bottom';
export type CSSPositionRight = 'right';

export type CSSCardinalPosition = CSSPositionTop | CSSPositionLeft | CSSPositionBottom | CSSPositionRight;

export type CSSPositionClosestSide = 'closest-side';
export type CSSPositionClosestCorner = 'closest-corner';
export type CSSPositionFarthestSide = 'farthest-side';
export type CSSPositionFarthestCorner = 'farthest-corner';

export type CSSExtentPosition = CSSPositionClosestSide | CSSPositionClosestCorner | CSSPositionFarthestSide | CSSPositionFarthestCorner;

export type CSSPositionCenter = 'center';

export const CSSCardinalPositions: Array<CSSCardinalPosition> = ['top', 'left', 'bottom', 'right'];

export const CSSExtentPositions: Array<CSSCardinalPosition> = ['closest-side', 'closest-corner', 'farthest-side', 'farthest-corner'];

export function isFromPreposition(stringComponent: StringComponent): boolean {
  return stringComponent.string === 'from';
}

export function isToPreposition(stringComponent: StringComponent): boolean {
  return stringComponent.string === 'to';
}

export function isAtPreposition(stringComponent: StringComponent): boolean {
  return stringComponent.string === 'at';
}

export function isCardinalPosition(stringComponent: StringComponent): boolean {
  return CSSCardinalPositions.indexOf(stringComponent.string) > -1;
}

export function isCenterPosition(stringComponent: StringComponent): boolean {
  return stringComponent.string === 'center';
}

export function isExtentPosition(stringComponent: StringComponent): boolean {
  return CSSExtentPositions.indexOf(stringComponent.string) > -1;
}

export function isPosition(component: Component): boolean {
  if (component.type === 'model') {
    return false;
  }

  if (component.type === 'number' && isPercentage(component)) {
    return true;
  }

  if (component.type === 'string') {
    return isCardinalPosition(component) || isCenterPosition(component) || isExtentPosition(component);
  }
}
