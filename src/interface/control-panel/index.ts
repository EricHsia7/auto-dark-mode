let controlPanelInitialized: boolean = false;

export function initializeControlPanel(stylesStrings): void {
  if (controlPanelInitialized) {
    return;
  } else {
    controlPanelInitialized = true;
  }
  const panel = document.createElement('div');
  panel.classList.add('auto_dark_mode_control_panel');
  panel.setAttribute('displayed', 'true');

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

  document.documentElement.appendChild(panel);
}

export function openControlPanel(): void {}
