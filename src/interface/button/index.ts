import { isFramed } from '../../lib/is-framed';
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
  if (isFramed()) {
    button.innerText = 'ADM';
    button.setAttribute('framed', 'true');
  } else {
    // button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M440-190q59.31 0 111.31-26.96T639.23-291q-129.15-3.77-219.19-92.38Q330-472 330-600q0-17.23 2.15-34.15 2.16-16.93 6.08-33.16-67 30.46-107.61 91.66Q190-514.46 190-440q0 104.23 72.88 177.12Q335.77-190 440-190Zm0 60q-129.38 0-219.69-90.31T130-440q0-54.15 17.27-103.77 17.27-49.61 48.58-89.58 31.3-39.96 74.65-67.46 43.35-27.5 96.11-36.8 21.93-3.77 35.35 13.46 13.42 17.23 3.89 37.3-9.31 20.39-12.58 42.31Q390-622.62 390-600q0 102.69 73.27 174.23 73.27 71.54 176.73 75 10.46.39 21.31.27 10.84-.11 21.3-3.35 18.7-5.46 31.7 8.7 13 14.15 6.23 31.84-34.39 84.39-111.12 133.85Q532.69-130 440-130Zm211.77-475-21.16 61.38q-3.23 8.7-9.92 13.66Q614-525 605.31-525q-14.77 0-22.77-11.85-8-11.84-3.54-25l101.23-292.38q3.23-9.08 11.12-14.92 7.88-5.85 17.96-5.85h21.38q10.08 0 18.16 5.85 8.07 5.84 11.3 14.92L861-561.46q4.46 13.15-3.35 24.81-7.8 11.65-22.57 11.65-8.7 0-15.39-4.77-6.69-4.77-9.92-13.46L788.23-605H651.77Zm14.54-44h107.38L720-816.16 666.31-649ZM418.54-383.69Z"/></svg>';
    button.setAttribute('framed', 'false');
  }
  button.addEventListener('click', function () {
    openPanel();
  });

  document.documentElement.appendChild(button);
}
