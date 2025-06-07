import { openControlPanel } from '../control-panel/index';

export function initializeButton(): void {
  const button = document.createElement('div');
  button.classList.add('auto_dark_mode_button');
  button.innerText = 'ADM';
  button.addEventListener('click', function () {
    openControlPanel();
  });

  document.documentElement.appendChild(button);
}
