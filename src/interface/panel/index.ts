let controlPanelInitialized: boolean = false;
let overlayElement;
let panelElement;

export function initializeControlPanel(stylesStrings): void {
  if (controlPanelInitialized) {
    return;
  } else {
    controlPanelInitialized = true;
  }

  const newOverlayElement = document.createElement('div');
  newOverlayElement.classList.add('auto_dark_mode_panel_overlay');

  const newSpaceElement = document.createElement('div');
  newSpaceElement.classList.add('auto_dark_mode_space');
  newSpaceElement.addEventListener('click', function () {
    closePanel();
  });

  const newPanelElement = document.createElement('div');
  newPanelElement.classList.add('auto_dark_mode_panel');

  const newPanelHeadElement = document.createElement('div');
  newPanelHeadElement.classList.add('auto_dark_mode_panel_head');

  const newPanelHeadTitleElement = document.createElement('div');
  newPanelHeadTitleElement.classList.add('auto_dark_mode_panel_head_title');
  newPanelHeadTitleElement.innerText = 'Auto Dark Mode';

  const newPanelBodyElement = document.createElement('div');
  newPanelBodyElement.classList.add('auto_dark_mode_panel_body');

  const newSwitchAllButtonElement = document.createElement('div');
  newSwitchAllButtonElement.classList.add('auto_dark_mode_switch_all_button');
  newSwitchAllButtonElement.innerText = 'Turn Off All';
  newSwitchAllButtonElement.setAttribute('state', 'on');

  ((switchAllButton2) => {
    switchAllButton2.addEventListener('click', function () {
      const state = switchAllButton2.getAttribute('state');
      const styleTags = document.querySelectorAll('style[auto-dark-mode-stylesheet-name]') as NodeListOf<HTMLStyleElement>;
      const toggles = document.querySelectorAll('.auto_dark_mode_panel .auto_dark_mode_panel_body .auto_dark_mode_panel_stylesheets .auto_dark_mode_panel_stylesheets_stylesheet .auto_dark_mode_panel_stylesheets_stylesheet_toggle') as NodeListOf<HTMLElement>;
      let disabled = true;
      let newState = 'off';
      let text = 'Turn On All';
      if (state === 'on') {
        disabled = true;
        newState = 'off';
        text = 'Turn On All';
      } else {
        disabled = false;
        newState = 'on';
        text = 'Turn Off All';
      }
      for (const styleTag of styleTags) {
        styleTag.disabled = disabled;
      }
      for (const toggle of toggles) {
        toggle.setAttribute('state', newState);
      }
      switchAllButton2.setAttribute('state', newState);
      switchAllButton2.innerText = text;
    });
  })(newSwitchAllButtonElement);

  const newStylesheetsElement = document.createElement('div');
  newStylesheetsElement.classList.add('auto_dark_mode_panel_stylesheets');

  for (const stylesString of stylesStrings) {
    const newStylesheetElement = document.createElement('div');
    newStylesheetElement.classList.add('auto_dark_mode_panel_stylesheets_stylesheet');

    const newStylesheetNameElement = document.createElement('div');
    newStylesheetNameElement.classList.add('auto_dark_mode_panel_stylesheets_stylesheet_name');
    newStylesheetNameElement.innerText = stylesString.name;

    const newStylesheetToggleElement = document.createElement('div');
    newStylesheetToggleElement.classList.add('auto_dark_mode_panel_stylesheets_stylesheet_toggle');
    newStylesheetToggleElement.setAttribute('state', 'on');
    newStylesheetToggleElement.setAttribute('name', stylesString.name);

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
    })(newStylesheetToggleElement);

    const stylesheetToggleOff = document.createElement('div');
    stylesheetToggleOff.classList.add('auto_dark_mode_panel_stylesheets_stylesheet_toggle_off');
    // stylesheetToggleOff.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M595.08-615.08q24.38 24.39 37.69 59.27 13.31 34.89 10.07 70.04 0 11.54-8.3 19.54-8.31 8-19.85 8-11.54 0-19.54-8t-8-19.54q3.85-26.38-4.34-50-8.19-23.61-25.19-40.61t-41-25.81q-24-8.81-50.62-4.58-11.54.39-19.92-7.73-8.39-8.11-8.77-19.65-.39-11.54 7.42-19.93 7.81-8.38 19.35-8.76 34.92-4 70.19 9.11 35.27 13.12 60.81 38.65ZM480-720q-21.31 0-41.81 2.08-20.5 2.07-40.81 6.84-12.77 2.62-23-3.65t-14.07-18.04q-3.85-12.15 2.54-23.11 6.38-10.96 18.53-13.58 24.16-5.77 48.81-8.15Q454.85-780 480-780q128.92 0 236.85 67 107.92 67 165.99 181.31 4 7.61 5.81 15.34 1.81 7.73 1.81 16.35 0 8.62-1.5 16.35-1.5 7.73-5.5 15.34-18.38 38.46-44.69 71.73t-57.93 61.12q-9.3 8.31-21.26 6.88-11.97-1.42-19.66-11.96-7.69-10.54-6.38-22.61 1.31-12.08 10.61-20.39 27.08-24.54 49.39-53.65Q815.85-466.31 832-500q-50-101-144.5-160.5T480-720Zm0 500q-126.31 0-231.54-67.5Q143.23-355 81.16-465.31q-5-7.61-7.31-16.54-2.31-8.92-2.31-18.15 0-9.23 2-17.85 2-8.61 7-16.84 22.31-40.77 50.54-77.66 28.23-36.88 64.92-66.11l-90.31-90.93q-8.3-8.92-8.19-21.19.12-12.27 8.81-20.96 8.69-8.69 21.08-8.69 12.38 0 21.07 8.69l663.08 663.08q8.31 8.31 8.81 20.57.5 12.27-8.81 21.58-8.69 8.69-21.08 8.69-12.38 0-21.07-8.69L628.62-245.85q-35.39 13.69-72.74 19.77Q518.54-220 480-220ZM238.16-636.31q-35.16 27.16-63.2 61.42Q146.92-540.62 128-500q50 101 144.5 160.5T480-280q25.77 0 50.73-3.46 24.96-3.46 49.58-10.69L529.69-346q-12.15 5.31-24.27 7.19-12.11 1.89-25.42 1.89-68.08 0-115.58-47.5T316.92-500q0-13.31 2.08-25.42 2.08-12.12 7-24.27l-87.84-86.62ZM541-531Zm-131.77 65.77Z"/></svg>`;

    const stylesheetToggleOn = document.createElement('div');
    stylesheetToggleOn.classList.add('auto_dark_mode_panel_stylesheets_stylesheet_toggle_on');
    // stylesheetToggleOn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480.09-336.92q67.99 0 115.49-47.59t47.5-115.58q0-67.99-47.59-115.49t-115.58-47.5q-67.99 0-115.49 47.59t-47.5 115.58q0 67.99 47.59 115.49t115.58 47.5ZM480-392q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 172q-126.31 0-231.04-67.39-104.73-67.38-167.19-177.3-5-8.62-7.31-17.37-2.3-8.75-2.3-17.96t2.3-17.94q2.31-8.73 7.31-17.35 62.46-109.92 167.19-177.3Q353.69-780 480-780q126.31 0 231.04 67.39 104.73 67.38 167.19 177.3 5 8.62 7.31 17.37 2.3 8.75 2.3 17.96t-2.3 17.94q-2.31 8.73-7.31 17.35-62.46 109.92-167.19 177.3Q606.31-220 480-220Zm0-280Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>`;

    newStylesheetElement.appendChild(newStylesheetNameElement);
    newStylesheetToggleElement.appendChild(stylesheetToggleOff);
    newStylesheetToggleElement.appendChild(stylesheetToggleOn);
    newStylesheetElement.appendChild(newStylesheetToggleElement);
    newStylesheetsElement.appendChild(newStylesheetElement);
  }

  newPanelBodyElement.appendChild(newSwitchAllButtonElement);
  newPanelBodyElement.appendChild(newStylesheetsElement);
  newPanelHeadElement.appendChild(newPanelHeadTitleElement);
  newPanelElement.appendChild(newPanelHeadElement);
  newPanelElement.appendChild(newPanelBodyElement);
  newOverlayElement.appendChild(newSpaceElement);
  newOverlayElement.appendChild(newPanelElement);
  document.documentElement.appendChild(newOverlayElement);

  overlayElement = document.querySelector('.auto_dark_mode_panel_overlay');
  panelElement = document.querySelector('.auto_dark_mode_panel');
}

export function openPanel(): void {
  if (!controlPanelInitialized) {
    return;
  }

  overlayElement.setAttribute('displayed', 'true');
  panelElement.setAttribute('displayed', 'true');

  overlayElement.addEventListener(
    'animationend',
    function (event: Event) {
      const target = event.target as HTMLElement;
      target.classList.add('auto_dark_mode_panel_overlay_faded_in');
      target.classList.remove('auto_dark_mode_panel_overlay_fade_in');
    },
    { once: true }
  );

  panelElement.addEventListener(
    'animationend',
    function (event: Event) {
      const target = event.target as HTMLElement;
      target.classList.add('auto_dark_mode_panel_slided_in');
      target.classList.remove('auto_dark_mode_panel_slide_in');
    },
    { once: true }
  );

  overlayElement.classList.add('auto_dark_mode_panel_overlay_fade_in');
  panelElement.classList.add('auto_dark_mode_panel_slide_in');
}

export function closePanel(): void {
  if (!controlPanelInitialized) {
    return;
  }

  overlayElement.addEventListener(
    'animationend',
    function (event: Event) {
      const target = event.target as HTMLElement;
      target.setAttribute('displayed', 'false');
      target.classList.remove('auto_dark_mode_panel_overlay_fade_out');
    },
    { once: true }
  );

  panelElement.addEventListener(
    'animationend',
    function (event: Event) {
      const target = event.target as HTMLElement;
      target.setAttribute('displayed', 'false');
      target.classList.remove('auto_dark_mode_panel_slide_out');
    },
    { once: true }
  );

  overlayElement.classList.add('auto_dark_mode_panel_overlay_fade_out');
  panelElement.classList.add('auto_dark_mode_panel_slide_out');
}
