let panelInitialized: boolean = false;
let overlayElement;
let panelElement;
let stylesheetsElement;
let stylesheetToggleElements;
let styleTagElements;
let stylesheetsQuantity;

export function initializePanel(stylesStrings): void {
  if (panelInitialized) {
    return;
  } else {
    panelInitialized = true;
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
        for (const styleTagElement of styleTagElements) {
          styleTagElement.disabled = true;
        }
      } else {
        for (let i = stylesheetsQuantity - 1; i >= 0; i--) {
          const state = stylesheetToggleElements[i].getAttribute('state');
          styleTagElements[i].disabled = state === 'off' ? true : false;
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
        const stylesheetsState = stylesheetsElement.getAttribute('state');
        if (stylesheetsState === 'on') {
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

  overlayElement = document.querySelector('.auto_dark_mode_panel_overlay') as HTMLElement;
  panelElement = overlayElement.querySelector('.auto_dark_mode_panel') as HTMLElement;
  stylesheetsElement = panelElement.querySelector('.auto_dark_mode_panel_stylesheets') as HTMLElement;
  stylesheetToggleElements = stylesheetsElement.querySelectorAll('.auto_dark_mode_panel_stylesheets_stylesheet .auto_dark_mode_panel_stylesheets_stylesheet_toggle') as NodeListOf<HTMLElement>;
  styleTagElements = document.querySelectorAll('style[auto-dark-mode-stylesheet-name]') as NodeListOf<HTMLStyleElement>;
  stylesheetsQuantity = stylesStrings.length;
}

export function openPanel(): void {
  if (!panelInitialized) {
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
  if (!panelInitialized) {
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
