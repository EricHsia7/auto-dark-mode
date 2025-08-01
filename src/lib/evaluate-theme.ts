import { isColorDark } from './is-color-dark';

export type theme = 'light' | 'dark';

export function evaluateTheme(backgroundColor: [red: number, green: number, blue: number, alpha: number], textColor: [red: number, green: number, blue: number, alpha: number]): theme {
  const [r1, g1, b1, a1] = backgroundColor;
  const [r2, g2, b2, a2] = textColor;

  console.log(0, backgroundColor, textColor);

  const p2 = isColorDark(r2, g2, b2, a2);

  if (a1 === 0 && p2 > 0.6) {
    return 'light';
  }

  const p1 = isColorDark(r1, g1, b1, a1);

  if (a2 === 0 && p1 < 0.4) {
    return 'light';
  }


  console.log(1, p1, p2);

  if (p2 > p1) {
    return 'light';
  } else {
    return 'dark';
  }
}
