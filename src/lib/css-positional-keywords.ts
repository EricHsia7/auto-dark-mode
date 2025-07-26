export type CSSPrepositionFrom = 'from';
export type CSSPrepositionTo = 'to';
export type CSSPrepositionAt = 'at';
export type CSSPreposition = CSSPrepositionFrom | CSSPrepositionTo | CSSPrepositionAt;

export type CSSPositionTop = 'top';
export type CSSPositionLeft = 'left';
export type CSSPositionBottom = 'bottom';
export type CSSPositionRight = 'right';

export type CSSPositionCenter = 'center';

export type CSSPositionClosestSide = 'closest-side';
export type CSSPositionClosestCorner = 'closest-corner';
export type CSSPositionFarthestSide = 'farthest-side';
export type CSSPositionFarthestCorner = 'farthest-corner';

export type CSSCardinalPosition = CSSPositionTop | CSSPositionLeft | CSSPositionBottom | CSSPositionRight;
export type CSSExtentPosition = CSSPositionClosestSide | CSSPositionClosestCorner | CSSPositionFarthestSide | CSSPositionFarthestCorner;
