import { openPanel } from '../panel/index';

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
    openPanel();
  });

  document.documentElement.appendChild(button);
}
