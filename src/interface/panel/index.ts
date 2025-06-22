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

  const newToggleElement = document.createElement('div');
  newToggleElement.classList.add('auto_dark_mode_toggle');
  newToggleElement.setAttribute('state', 'on');

  ((toggleElement) => {
    toggleElement.addEventListener('click', function () {
      const state = toggleElement.getAttribute('state');
      const styleTags = document.querySelectorAll('style[auto-dark-mode-stylesheet-name]') as NodeListOf<HTMLStyleElement>;
      const stylesheetsElement = document.querySelector('.auto_dark_mode_panel .auto_dark_mode_panel_body .auto_dark_mode_panel_stylesheets') as HTMLElement;
      const toggles = stylesheetsElement.querySelectorAll('.auto_dark_mode_panel_stylesheets_stylesheet .auto_dark_mode_panel_stylesheets_stylesheet_toggle') as NodeListOf<HTMLElement>;
      const quantity = toggles.length;
      let disabled = true;
      let newState = 'off';
      if (state === 'on') {
        disabled = true;
        newState = 'off';
      } else {
        disabled = false;
        newState = 'on';
      }
      if (disabled) {
        for (const styleTag of styleTags) {
          styleTag.disabled = true;
        }
      } else {
        for (let i = quantity - 1; i >= 0; i--) {
          const state = toggles[i].getAttribute('state');
          styleTags[i].disabled = state === 'on' ? true : false;
        }
      }
      toggleElement.setAttribute('state', newState);
      stylesheetsElement.setAttribute('state', newState);
    });
  })(newToggleElement);

  const newToggleThumbElement = document.createElement('div');
  newToggleThumbElement.classList.add('auto_dark_mode_toggle_thumb');

  const newStylesheetsElement = document.createElement('div');
  newStylesheetsElement.classList.add('auto_dark_mode_panel_stylesheets');
  newStylesheetsElement.setAttribute('state', 'on');

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

  newPanelHeadElement.appendChild(newPanelHeadTitleElement);

  newToggleElement.appendChild(newToggleThumbElement);
  newPanelHeadElement.appendChild(newToggleElement);

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
