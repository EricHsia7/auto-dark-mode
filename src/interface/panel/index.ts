import { StyleSheetCSSArray, StyleSheetCSSItem } from '../../lib/styles';

let panelInitialized: boolean = false;
let overlayElement;
let containerElement;
let panelElement;
let stylesheetsElement;
let toggleElement;

function generateElementOfStylesheet(): HTMLElement {
  const newStylesheetElement = document.createElement('div');
  newStylesheetElement.classList.add('auto_dark_mode_panel_stylesheets_stylesheet');

  const newStylesheetNameElement = document.createElement('div');
  newStylesheetNameElement.classList.add('auto_dark_mode_panel_stylesheets_stylesheet_name');

  const newStylesheetToggleElement = document.createElement('div');
  newStylesheetToggleElement.classList.add('auto_dark_mode_panel_stylesheets_stylesheet_toggle');
  newStylesheetToggleElement.setAttribute('state', 'on');
  newStylesheetToggleElement.setAttribute('name', '');
  newStylesheetToggleElement.onclick = function () {
    const stylesheetsState = stylesheetsElement.getAttribute('state');
    if (stylesheetsState === 'on') {
      const currentState = newStylesheetToggleElement.getAttribute('state');
      const nameValue = newStylesheetToggleElement.getAttribute('name');
      const styleTag = document.querySelector(`style[auto-dark-mode-stylesheet-name="${nameValue}"]`) as HTMLStyleElement;
      if (currentState === 'on') {
        newStylesheetToggleElement.setAttribute('state', 'off');
        styleTag.disabled = true;
      } else {
        newStylesheetToggleElement.setAttribute('state', 'on');
        styleTag.disabled = false;
      }
    }
  };

  const newThumbElement = document.createElement('div');
  newThumbElement.classList.add('auto_dark_mode_panel_stylesheets_stylesheet_toggle_thumb');

  newStylesheetElement.appendChild(newStylesheetNameElement);
  newStylesheetToggleElement.appendChild(newThumbElement);
  newStylesheetElement.appendChild(newStylesheetToggleElement);

  return newStylesheetElement;
}

function generateElementOfStyleTag(): HTMLStyleElement {
  const newStyleTagElement = document.createElement('style');
  newStyleTagElement.setAttribute('auto-dark-mode-stylesheet-name', '');
  return newStyleTagElement;
}

export function updateStylesheets(stylesheets: StyleSheetCSSArray): void {
  function updateStylesheet(stylesheetElement: HTMLElement, styleTagElement: HTMLStyleElement, stylesheet: StyleSheetCSSItem, state: string): void {
    function updateName(stylesheetElement: HTMLElement, stylesheet: StyleSheetCSSItem): void {
      const thisNameElement = stylesheetElement.querySelector('.auto_dark_mode_panel_stylesheets_stylesheet_name') as HTMLElement;
      const thisToggleElement = stylesheetElement.querySelector('.auto_dark_mode_panel_stylesheets_stylesheet_toggle') as HTMLElement;
      if (thisNameElement.innerText !== stylesheet.name || thisToggleElement.getAttribute('name') !== stylesheet.name) {
        thisNameElement.innerText = stylesheet.name;
        thisToggleElement.setAttribute('name', stylesheet.name);
      }
    }

    function updateStyleTag(stylesheetElement: HTMLElement, styleTagElement: HTMLStyleElement, stylesheet: StyleSheetCSSItem, state: string): void {
      const thisToggleElement = stylesheetElement.querySelector('.auto_dark_mode_panel_stylesheets_stylesheet_toggle') as HTMLElement;
      const thisState = thisToggleElement.getAttribute('state');
      styleTagElement.setAttribute('auto-dark-mode-stylesheet-name', stylesheet.name);
      if (styleTagElement.textContent !== stylesheet.css) {
        styleTagElement.textContent = stylesheet.css;
      }
      const newDisabled = thisState === 'on' && state === 'on' ? false : true;
      if (newDisabled !== styleTagElement.disabled) {
        styleTagElement.disabled = newDisabled;
      }
    }

    updateName(stylesheetElement, stylesheet);
    updateStyleTag(stylesheetElement, styleTagElement, stylesheet, state);
  }

  if (!panelInitialized) {
    return;
  }

  const currentStyleTagQuantity = document.querySelectorAll('style[auto-dark-mode-stylesheet-name]').length;
  const stylesheetsQuantity = stylesheets.length;
  if (stylesheetsQuantity !== currentStyleTagQuantity) {
    const capacity = currentStyleTagQuantity - stylesheetsQuantity;
    if (capacity < 0) {
      const newStyleTagsFragment = new DocumentFragment();
      const newStylesheetsFragment = new DocumentFragment();
      for (let o = 0; o < Math.abs(capacity); o++) {
        const newStyleTagElement = generateElementOfStyleTag();
        newStyleTagsFragment.appendChild(newStyleTagElement);
        const newStylesheetElement = generateElementOfStylesheet();
        newStylesheetsFragment.appendChild(newStylesheetElement);
      }
      document.documentElement.append(newStyleTagsFragment);
      stylesheetsElement.append(newStylesheetsFragment);
    } else {
      const styleTagElements = document.querySelectorAll('style[auto-dark-mode-stylesheet-name]');
      const stylesheetElements = stylesheetsElement.querySelectorAll('.auto_dark_mode_panel_stylesheets_stylesheet');
      for (let o = 0; o < Math.abs(capacity); o++) {
        const groupIndex = currentStyleTagQuantity - 1 - o;
        styleTagElements[groupIndex].remove();
        stylesheetElements[groupIndex].remove();
      }
    }
  }

  const styleTagElements = document.querySelectorAll('style[auto-dark-mode-stylesheet-name]');
  const stylesheetElements = stylesheetsElement.querySelectorAll('.auto_dark_mode_panel_stylesheets_stylesheet');
  const state = toggleElement.getAttribute('state');

  for (let i = 0; i < stylesheetsQuantity; i++) {
    const stylesheet = stylesheets[i];
    const stylesheetElement = stylesheetElements[i];
    const styleTagElement = styleTagElements[i];
    updateStylesheet(stylesheetElement, styleTagElement, stylesheet, state);
  }
}

export function initializePanel(): void {
  if (panelInitialized) {
    return;
  } else {
    panelInitialized = true;
  }

  const newOverlayElement = document.createElement('div');
  newOverlayElement.classList.add('auto_dark_mode_panel_overlay');

  const newContainerElement = document.createElement('div');
  newContainerElement.classList.add('auto_dark_mode_panel_container');

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

  ((newToggleElement1) => {
    newToggleElement1.addEventListener('click', function () {
      const stylesheetToggleElements = stylesheetsElement.querySelectorAll('.auto_dark_mode_panel_stylesheets_stylesheet .auto_dark_mode_panel_stylesheets_stylesheet_toggle') as NodeListOf<HTMLElement>;
      const styleTagElements = document.querySelectorAll('style[auto-dark-mode-stylesheet-name]') as NodeListOf<HTMLStyleElement>;
      const stylesheetsQuantity = styleTagElements.length;
      const state = newToggleElement1.getAttribute('state');
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
          if (styleTagElement.disabled !== true) {
            styleTagElement.disabled = true;
          }
        }
      } else {
        for (let i = stylesheetsQuantity - 1; i >= 0; i--) {
          const state = stylesheetToggleElements[i].getAttribute('state');
          const newDisabled = state === 'off' ? true : false;
          if (newDisabled !== styleTagElements[i].disabled) {
            styleTagElements[i].disabled = newDisabled;
          }
        }
      }
      newToggleElement1.setAttribute('state', newState);
      stylesheetsElement.setAttribute('state', newState);
    });
  })(newToggleElement);

  const newToggleThumbElement = document.createElement('div');
  newToggleThumbElement.classList.add('auto_dark_mode_toggle_thumb');

  const newStylesheetsElement = document.createElement('div');
  newStylesheetsElement.classList.add('auto_dark_mode_panel_stylesheets');
  newStylesheetsElement.setAttribute('state', 'on');

  newPanelBodyElement.appendChild(newStylesheetsElement);

  newPanelHeadElement.appendChild(newPanelHeadTitleElement);

  newToggleElement.appendChild(newToggleThumbElement);
  newPanelHeadElement.appendChild(newToggleElement);

  newPanelElement.appendChild(newPanelHeadElement);

  newPanelElement.appendChild(newPanelBodyElement);

  newContainerElement.appendChild(newSpaceElement);

  newContainerElement.appendChild(newPanelElement);

  document.documentElement.appendChild(newOverlayElement);

  document.documentElement.appendChild(newContainerElement);

  overlayElement = document.querySelector('.auto_dark_mode_panel_overlay') as HTMLElement;
  containerElement = document.querySelector('.auto_dark_mode_panel_container') as HTMLElement;
  panelElement = containerElement.querySelector('.auto_dark_mode_panel') as HTMLElement;
  stylesheetsElement = panelElement.querySelector('.auto_dark_mode_panel_stylesheets') as HTMLElement;
  toggleElement = panelElement.querySelector('.auto_dark_mode_panel_head .auto_dark_mode_toggle') as HTMLElement;
}

export function openPanel(): void {
  if (!panelInitialized) {
    return;
  }

  overlayElement.setAttribute('displayed', 'true');
  containerElement.setAttribute('displayed', 'true');

  overlayElement.addEventListener(
    'animationend',
    function (event: Event) {
      const target = event.target as HTMLElement;
      target.classList.add('auto_dark_mode_panel_overlay_faded_in');
      target.classList.remove('auto_dark_mode_panel_overlay_fade_in');
    },
    { once: true }
  );

  containerElement.addEventListener(
    'animationend',
    function (event: Event) {
      const target = event.target as HTMLElement;
      target.classList.add('auto_dark_mode_panel_container_slided_in');
      target.classList.remove('auto_dark_mode_panel_container_slide_in');
    },
    { once: true }
  );

  overlayElement.classList.add('auto_dark_mode_panel_overlay_fade_in');
  containerElement.classList.add('auto_dark_mode_panel_container_slide_in');
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

  containerElement.addEventListener(
    'animationend',
    function (event: Event) {
      const target = event.target as HTMLElement;
      target.setAttribute('displayed', 'false');
      target.classList.remove('auto_dark_mode_panel_container_slide_out');
    },
    { once: true }
  );

  overlayElement.classList.add('auto_dark_mode_panel_overlay_fade_out');
  containerElement.classList.add('auto_dark_mode_panel_container_slide_out');
}
