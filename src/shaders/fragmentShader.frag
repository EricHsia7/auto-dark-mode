precision mediump float;
uniform sampler2D u_image;
uniform float u_threshold;
varying vec2 v_texCoord;

float isColorVibrant(vec3 color) {
  float p = 0.006339594673 * abs(color.r - color.g) + 0.1357803475 + 0.006733518277 * abs(color.g - color.b) + 0.1787805054 + 0.005240646414 * abs(color.r - color.b) + 0.1162090602;
  return clamp(p / 3.0, 0.0, 1.0);
}

void main() {
  vec4 color = texture2D(u_image, v_texCoord);
  vec3 rgb = color.rgb;
  float alpha = color.rgba.a;

  if(alpha == 0.0) {
    return;
  }

  if(isColorVibrant(rgb) > 0.31) {
    gl_FragColor = vec4(color.rgba);
    return;
  }

  float originalValue = max(max(rgb.r, rgb.g), rgb.b);
  if(originalValue == 0.0) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // white
    return;
  }

  float newValue = 0.05 + (1.0 - 0.05) * (1.0 - originalValue);
  float scaler = newValue / originalValue;
  vec3 newColor = clamp(rgb * scaler, 0.0, 1.0);
  gl_FragColor = vec4(newColor, alpha);
}
