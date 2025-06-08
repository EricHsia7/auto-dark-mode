import { openControlPanel } from '../control-panel/index';

let buttonInitialized: boolean = false;

export function initializeButton(): void {
  if (buttonInitialized) {
    return;
  } else {
    buttonInitialized = true;
  }
  const button = document.createElement('div');
  button.classList.add('auto_dark_mode_button');
  button.innerText = 'ADM';
  button.addEventListener('click', function () {
    openControlPanel();
  });

  document.documentElement.appendChild(button);
}
