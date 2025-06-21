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

  const newToggleAllButtonElement = document.createElement('div');
  newToggleAllButtonElement.classList.add('auto_dark_mode_toggle_all_button');
  newToggleAllButtonElement.innerText = 'Turn Off All';
  newToggleAllButtonElement.setAttribute('state', 'on');

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
  })(newToggleAllButtonElement);

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

    const newThumbElement = document.createElement('div');
    newThumbElement.classList.add('auto_dark_mode_panel_stylesheets_stylesheet_toggle_thumb');

    newStylesheetElement.appendChild(newStylesheetNameElement);
    newStylesheetToggleElement.appendChild(newThumbElement);
    newStylesheetElement.appendChild(newStylesheetToggleElement);
    newStylesheetsElement.appendChild(newStylesheetElement);
  }

  newPanelBodyElement.appendChild(newStylesheetsElement);

  newPanelHeadElement.appendChild(newToggleAllButtonElement);
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
