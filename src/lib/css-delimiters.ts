export const cssDelimiters = {
  'linear-gradient': [','],
  'radial-gradient': [','],
  'conic-gradient': [','],
  'rgb': [',', ' ', '/'],
  'rgba': [',', ' '],
  'hsl': [',', ' ', '/'],
  'hsla': [',', ' '],
  'hwb': [' ', ',', '/'],
  'var': [',', ' '],
  'color-mix': [',', '/'],
  'calc': ['+', '-', '*', '/'], // handled differently
  'default': [',', ' ']
};

export const cssPrimaryDelimiters = {
  'linear-gradient': ',',
  'radial-gradient': ',',
  'conic-gradient': ',',
  'rgb': ',',
  'rgba': ',',
  'hsl': ',',
  'hsla': ',',
  'hwb': ' ',
  'var': ',',
  'color-mix': ',',
  'default': ','
};
