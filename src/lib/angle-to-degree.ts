import { NumberComponent } from './component';

const toGRAD = 0.9; // 400grad = 1 full circle = 360deg
const toRAD = 180 / Math.PI;
const toTURN = 360;

function toArgumentAngle(deg: number): number {
  if (0 <= deg && deg < 360) {
    return deg;
  }
  return deg % 360;
}

export function angleToDegrees(numberComponent: NumberComponent): number {
  switch (numberComponent.unit) {
    case 'deg':
      return toArgumentAngle(numberComponent.number);
      break;
    case 'grad':
      return toArgumentAngle(numberComponent.number * toGRAD);
      break;
    case 'rad':
      return toArgumentAngle(numberComponent.number * toRAD);
      break;
    case 'turn':
      return toArgumentAngle(numberComponent.number * toTURN);
      break;
    default:
      return 0;
      break;
  }
}
