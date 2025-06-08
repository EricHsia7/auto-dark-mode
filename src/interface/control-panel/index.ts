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
    stylesheetToggle.setAttribute('state', 'on');
    stylesheetToggle.setAttribute('name', stylesString.name);
    ((stylesheetToggle2) => {
      stylesheetToggle2.addEventListener('click', function () {
        const currentState = stylesheetToggle2.getAttribute('state');
        const nameValue = stylesheetToggle2.getAttribute('name');
        const styleTag = document.querySelector(`style[auto-dark-mode-stylesheet-name="${nameValue}"]`) as HTMLStyleElement;
        if (currentState === 'on') {
          stylesheetToggle2.setAttribute('state', 'off');
          styleTag.disabled = true;
        } else {
          stylesheetToggle2.setAttribute('state', 'on');
          styleTag.disabled = false;
        }
      });
    })(stylesheetToggle);

    const stylesheetToggleOff = document.createElement('div');
    stylesheetToggleOff.classList.add('auto_dark_mode_control_panel_stylesheets_stylesheet_toggle_off');
    stylesheetToggleOff.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M595.08-615.08q24.38 24.39 37.69 59.27 13.31 34.89 10.07 70.04 0 11.54-8.3 19.54-8.31 8-19.85 8-11.54 0-19.54-8t-8-19.54q3.85-26.38-4.34-50-8.19-23.61-25.19-40.61t-41-25.81q-24-8.81-50.62-4.58-11.54.39-19.92-7.73-8.39-8.11-8.77-19.65-.39-11.54 7.42-19.93 7.81-8.38 19.35-8.76 34.92-4 70.19 9.11 35.27 13.12 60.81 38.65ZM480-720q-21.31 0-41.81 2.08-20.5 2.07-40.81 6.84-12.77 2.62-23-3.65t-14.07-18.04q-3.85-12.15 2.54-23.11 6.38-10.96 18.53-13.58 24.16-5.77 48.81-8.15Q454.85-780 480-780q128.92 0 236.85 67 107.92 67 165.99 181.31 4 7.61 5.81 15.34 1.81 7.73 1.81 16.35 0 8.62-1.5 16.35-1.5 7.73-5.5 15.34-18.38 38.46-44.69 71.73t-57.93 61.12q-9.3 8.31-21.26 6.88-11.97-1.42-19.66-11.96-7.69-10.54-6.38-22.61 1.31-12.08 10.61-20.39 27.08-24.54 49.39-53.65Q815.85-466.31 832-500q-50-101-144.5-160.5T480-720Zm0 500q-126.31 0-231.54-67.5Q143.23-355 81.16-465.31q-5-7.61-7.31-16.54-2.31-8.92-2.31-18.15 0-9.23 2-17.85 2-8.61 7-16.84 22.31-40.77 50.54-77.66 28.23-36.88 64.92-66.11l-90.31-90.93q-8.3-8.92-8.19-21.19.12-12.27 8.81-20.96 8.69-8.69 21.08-8.69 12.38 0 21.07 8.69l663.08 663.08q8.31 8.31 8.81 20.57.5 12.27-8.81 21.58-8.69 8.69-21.08 8.69-12.38 0-21.07-8.69L628.62-245.85q-35.39 13.69-72.74 19.77Q518.54-220 480-220ZM238.16-636.31q-35.16 27.16-63.2 61.42Q146.92-540.62 128-500q50 101 144.5 160.5T480-280q25.77 0 50.73-3.46 24.96-3.46 49.58-10.69L529.69-346q-12.15 5.31-24.27 7.19-12.11 1.89-25.42 1.89-68.08 0-115.58-47.5T316.92-500q0-13.31 2.08-25.42 2.08-12.12 7-24.27l-87.84-86.62ZM541-531Zm-131.77 65.77Z"/></svg>`;

    const stylesheetToggleOn = document.createElement('div');
    stylesheetToggleOn.classList.add('auto_dark_mode_control_panel_stylesheets_stylesheet_toggle_on');
    stylesheetToggleOn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480.09-336.92q67.99 0 115.49-47.59t47.5-115.58q0-67.99-47.59-115.49t-115.58-47.5q-67.99 0-115.49 47.59t-47.5 115.58q0 67.99 47.59 115.49t115.58 47.5ZM480-392q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 172q-126.31 0-231.04-67.39-104.73-67.38-167.19-177.3-5-8.62-7.31-17.37-2.3-8.75-2.3-17.96t2.3-17.94q2.31-8.73 7.31-17.35 62.46-109.92 167.19-177.3Q353.69-780 480-780q126.31 0 231.04 67.39 104.73 67.38 167.19 177.3 5 8.62 7.31 17.37 2.3 8.75 2.3 17.96t-2.3 17.94q-2.31 8.73-7.31 17.35-62.46 109.92-167.19 177.3Q606.31-220 480-220Zm0-280Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>`;

    stylesheet.appendChild(stylesheetName);
    stylesheetToggle.appendChild(stylesheetToggleOff);
    stylesheetToggle.appendChild(stylesheetToggleOn);
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
  const mask: HTMLElement = openControlPanel.mask || (openControlPanel.mask = document.querySelector('.auto_dark_mode_control_panel_mask'));
  const panel: HTMLElement = openControlPanel.panel || (openControlPanel.panel = document.querySelector('.auto_dark_mode_control_panel'));
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
  const mask: HTMLElement = closeControlPanel.mask || (closeControlPanel.mask = document.querySelector('.auto_dark_mode_control_panel_mask'));
  const panel: HTMLElement = closeControlPanel.panel || (closeControlPanel.panel = document.querySelector('.auto_dark_mode_control_panel'));

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
