import { isFramed } from '../../lib/is-framed';

export function initializeFrame(): void {
  if (!isFramed()) {
    return;
  }

  const newFrameElement = document.createElement('div');
  newFrameElement.classList.add('auto_dark_mode_frame');
  document.documentElement.appendChild(newFrameElement);
}
