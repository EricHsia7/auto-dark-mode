import { initialize } from './initialize';

var autoDarkMode = {
  initialize
};

window.addEventListener('load', function () {
  autoDarkMode.initialize();
});

export default autoDarkMode;
