import { NumberComponent } from './component';

// Relative Percentage
export type CSSUnitPercentage = '%';

// Absolute Length Units
export type CSSUnitPx = 'px'; // Pixels
export type CSSUnitPt = 'pt'; // Points
export type CSSUnitPc = 'pc'; // Picas
export type CSSUnitCm = 'cm'; // Centimeters
export type CSSUnitIn = 'in'; // Inches
export type CSSUnitMm = 'mm'; // Millimeters
export type CSSUnitQ = 'Q'; // Quarter-millimeters

// Angle Units
export type CSSUnitDeg = 'deg'; // Degrees
export type CSSUnitRad = 'rad'; // Radians
export type CSSUnitTurn = 'turn'; // Turns
export type CSSUnitGrad = 'grad'; // Gradians

// Viewport-relative Units
export type CSSUnitDvh = 'dvh';
export type CSSUnitDvw = 'dvw';
export type CSSUnitLvh = 'lvh';
export type CSSUnitLvw = 'lvw';
export type CSSUnitSvh = 'svh';
export type CSSUnitSvw = 'svw';
export type CSSUnitVb = 'vb';
export type CSSUnitVh = 'vh';
export type CSSUnitVi = 'vi';
export type CSSUnitVmax = 'vmax';
export type CSSUnitVmin = 'vmin';
export type CSSUnitVw = 'vw';

// Relative Font-based Units
export type CSSUnitEm = 'em';
export type CSSUnitCh = 'ch';
export type CSSUnitCap = 'cap';
export type CSSUnitIc = 'ic';
export type CSSUnitLh = 'lh';

// Root-relative Font Units
export type CSSUnitRem = 'rem';
export type CSSUnitRch = 'rch';
export type CSSUnitRcap = 'rcap';
export type CSSUnitRic = 'ric';
export type CSSUnitRlh = 'rlh';

// Container Query Units
export type CSSUnitCqw = 'cqw';
export type CSSUnitCqh = 'cqh';
export type CSSUnitCqi = 'cqi';
export type CSSUnitCqb = 'cqb';
export type CSSUnitCqmin = 'cqmin';
export type CSSUnitCqmax = 'cqmax';

// For numbers without unit
export type CSSUnitNone = '';

// All angle-related units
export type CSSAngleUnit = CSSUnitDeg | CSSUnitRad | CSSUnitTurn | CSSUnitGrad;

// Length-related units
export type CSSLengthAbsoluteUnit = CSSUnitPx | CSSUnitPt | CSSUnitPc | CSSUnitCm | CSSUnitIn | CSSUnitMm | CSSUnitQ;

export type CSSLengthFontRelativeUnit = CSSUnitEm | CSSUnitCh | CSSUnitCap | CSSUnitIc | CSSUnitLh | CSSUnitRem | CSSUnitRch | CSSUnitRcap | CSSUnitRic | CSSUnitRlh;

export type CSSLengthViewportUnit = CSSUnitDvh | CSSUnitDvw | CSSUnitLvh | CSSUnitLvw | CSSUnitSvh | CSSUnitSvw | CSSUnitVb | CSSUnitVh | CSSUnitVi | CSSUnitVmax | CSSUnitVmin | CSSUnitVw;

export type CSSLengthContainerUnit = CSSUnitCqw | CSSUnitCqh | CSSUnitCqi | CSSUnitCqb | CSSUnitCqmin | CSSUnitCqmax;

export type CSSLengthUnit = CSSUnitPercentage | CSSLengthAbsoluteUnit | CSSLengthFontRelativeUnit | CSSLengthViewportUnit | CSSLengthContainerUnit;

// All relative units
export type CSSRelativeUnit = CSSUnitPercentage | CSSUnitEm | CSSUnitCh | CSSUnitCap | CSSUnitIc | CSSUnitLh | CSSUnitRem | CSSUnitRch | CSSUnitRcap | CSSUnitRic | CSSUnitRlh | CSSUnitCqw | CSSUnitCqh | CSSUnitCqi | CSSUnitCqb | CSSUnitCqmin | CSSUnitCqmax;

// All absolute units
export type CSSAbsoluteUnit = CSSLengthAbsoluteUnit | CSSLengthViewportUnit;

// Font-relevant units
export type CSSFontUnit = CSSUnitPercentage | CSSLengthAbsoluteUnit | CSSLengthFontRelativeUnit;

// Units related to spatial dimensions
export type CSSDistanceUnit = CSSLengthUnit | CSSUnitPercentage;

// Units relevant to layout positioning
export type CSSPositionUnit = CSSUnitPercentage;

// Units relevant to viewport
export type CSSViewportUnit = CSSLengthViewportUnit;

const CSSLengthUnits: Array<CSSLengthUnit> = ['%', 'Q', 'cap', 'ch', 'cm', 'cqb', 'cqh', 'cqi', 'cqmax', 'cqmin', 'cqw', 'dvh', 'dvw', 'em', 'ic', 'in', 'lh', 'lvh', 'mm', 'pc', 'pt', 'px', 'rcap', 'rch', 'rem', 'ric', 'rlh', 'svh', 'svw', 'vb', 'vh', 'vi', 'vmax', 'vmin', 'vw'];

const CSSAngleUnits: Array<CSSAngleUnit> = ['deg', 'grad', 'rad', 'turn'];

export function isPercentage(numberComponent: NumberComponent): boolean {
  return numberComponent.unit === '%';
}

export function isLength(numberComponent: NumberComponent): boolean {
  if (numberComponent.number === 0 && numberComponent.unit === '') {
    return true;
  }

  if (CSSLengthUnits.indexOf(numberComponent.unit) > -1) {
    return true;
  }

  return false;
}

export function isAngle(numberComponent: NumberComponent): boolean {
  if (numberComponent.number === 0 && numberComponent.unit === '') {
    return true;
  }

  if (CSSAngleUnits.indexOf(numberComponent.unit) > -1) {
    return true;
  }

  return false;
}
