let controlPanelInitialized: boolean = false;

export function initializeControlPanel(stylesStrings): void {
  if (controlPanelInitialized) {
    return;
  } else {
    controlPanelInitialized = true;
  }

  const mask = document.createElement('div');
  mask.classList.add('auto_dark_mode_control_panel_mask');
  mask.addEventListener('click', function () {
    closeControlPanel();
  });

  const panel = document.createElement('div');
  panel.classList.add('auto_dark_mode_control_panel');

  const panelHead = document.createElement('div');
  panelHead.classList.add('auto_dark_mode_control_panel_head');
  panelHead.innerText = 'Auto Dark Mode';

  const panelBody = document.createElement('div');
  panelBody.classList.add('auto_dark_mode_control_panel_body');

  const stylesheets = document.createElement('div');
  stylesheets.classList.add('auto_dark_mode_control_panel_stylesheets');

  const stylesheetsHead = document.createElement('div');
  stylesheetsHead.classList.add('auto_dark_mode_control_panel_stylesheets_head');

  const stylesheetsHeadIcon = document.createElement('div');
  stylesheetsHeadIcon.classList.add('auto_dark_mode_control_panel_stylesheets_head_icon');
  stylesheetsHeadIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M182.92-394.85q-11.76-8.92-11.65-23.42.12-14.5 11.89-23.81 8.3-6.07 18.23-6.07 9.92 0 18.23 6.07l252.69 195.54q3.46 2.69 7.69 2.69t7.69-2.69l252.69-195.54q8.31-6.07 18.23-6.07 9.93 0 18.23 6.07 11.77 9.31 11.89 23.81.11 14.5-11.65 23.42L524.38-198.7q-20.07 15.47-44.38 15.47-24.31 0-44.38-15.47l-252.7-196.15Zm252.7 18.77-210-163.23q-27.93-21.69-27.93-56.84 0-35.16 27.93-56.85l210-163.23q20.07-15.46 44.38-15.46 24.31 0 44.38 15.46l210 163.23q27.93 21.69 27.93 56.85 0 35.15-27.93 56.84l-210 163.23q-20.07 15.46-44.38 15.46-24.31 0-44.38-15.46Zm52.07-47.84 209.62-162.62q5-3.84 5-9.61t-5-9.62L487.69-768.38q-3.46-2.7-7.69-2.7t-7.69 2.7L262.69-605.77q-5 3.85-5 9.62t5 9.61l209.62 162.62q3.46 2.69 7.69 2.69t7.69-2.69ZM480-596.15Z"/></svg>`;

  const stylesheetsHeadTitle = document.createElement('div');
  stylesheetsHeadTitle.classList.add('auto_dark_mode_control_panel_stylesheets_head_title');
  stylesheetsHeadTitle.innerText = 'Style Sheets';

  const stylesheetsBody = document.createElement('div');
  stylesheetsBody.classList.add('auto_dark_mode_control_panel_stylesheets_body');

  stylesheetsHead.appendChild(stylesheetsHeadIcon);
  stylesheetsHead.appendChild(stylesheetsHeadTitle);
  stylesheets.appendChild(stylesheetsHead);

  for (const stylesString of stylesStrings) {
    const stylesheet = document.createElement('div');
    stylesheet.classList.add('auto_dark_mode_control_panel_stylesheets_stylesheet');

    const stylesheetName = document.createElement('div');
    stylesheetName.classList.add('auto_dark_mode_control_panel_stylesheets_stylesheet_name');
    stylesheetName.innerText = stylesString.name;

    const stylesheetToggle = document.createElement('div');
    stylesheetToggle.classList.add('auto_dark_mode_control_panel_stylesheets_stylesheet_toggle');

    stylesheet.appendChild(stylesheetName);
    stylesheet.appendChild(stylesheetToggle);
    stylesheetsBody.appendChild(stylesheet);
  }

  stylesheets.appendChild(stylesheetsBody);

  panelBody.appendChild(stylesheets);
  panel.appendChild(panelHead);
  panel.appendChild(panelBody);

  document.documentElement.appendChild(mask);
  document.documentElement.appendChild(panel);
}

export function openControlPanel(): void {
  const mask = document.querySelector('.auto_dark_mode_control_panel_mask') as HTMLElement;
  const panel = document.querySelector('.auto_dark_mode_control_panel') as HTMLElement;
  mask.setAttribute('displayed', 'true');
  panel.setAttribute('displayed', 'true');

  mask.addEventListener(
    'animationend',
    function (event: Event) {
      const target = event.target as HTMLElement;
      target.classList.add('auto_dark_mode_control_panel_mask_faded_in');
      target.classList.remove('auto_dark_mode_control_panel_mask_fade_in');
    },
    { once: true }
  );
  panel.addEventListener(
    'animationend',
    function (event: Event) {
      const target = event.target as HTMLElement;
      target.classList.add('auto_dark_mode_control_panel_slided_in');
      target.classList.remove('auto_dark_mode_control_panel_slide_in');
    },
    { once: true }
  );

  mask.classList.add('auto_dark_mode_control_panel_mask_fade_in');
  panel.classList.add('auto_dark_mode_control_panel_slide_in');
}

export function closeControlPanel(): void {
  const mask = document.querySelector('.auto_dark_mode_control_panel_mask') as HTMLElement;
  const panel = document.querySelector('.auto_dark_mode_control_panel') as HTMLElement;

  mask.addEventListener(
    'animationend',
    function (event: Event) {
      const target = event.target as HTMLElement;
      target.classList.remove('auto_dark_mode_control_panel_mask_fade_out');
      mask.setAttribute('displayed', 'false');
    },
    { once: true }
  );
  panel.addEventListener(
    'animationend',
    function (event: Event) {
      const target = event.target as HTMLElement;
      target.classList.remove('auto_dark_mode_control_panel_slide_out');
      panel.setAttribute('displayed', 'false');
    },
    { once: true }
  );

  mask.classList.add('auto_dark_mode_control_panel_mask_fade_out');
  panel.classList.add('auto_dark_mode_control_panel_slide_out');
}
