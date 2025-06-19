import vertexShader from '../shaders/vertexShader.vert';
import fragmentShader from '../shaders/fragmentShader.frag';

// Compile and link shader program
function createProgram(gl) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };

  const vs = compile(gl.VERTEX_SHADER, vertexShader);
  const fs = compile(gl.FRAGMENT_SHADER, fragmentShader);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
}

async function processImage(blob: Blob): Promise<Blob | false> {
  // Convert blob to image bitmap
  const imageBitmap = await createImageBitmap(blob, { imageOrientation: 'flipY' });
  const width = imageBitmap.width;
  const height = imageBitmap.height;

  if (width > 2048 || height > 2048) {
    return false;
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const gl = canvas.getContext('webgl', { alpha: true });

  if (!gl) throw new Error('WebGL not supported');

  // Enable alpha channel
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Clear background
  gl.clearColor(0.0, 0.0, 0.0, 0.0); // RGBA, with alpha = 0 (fully transparent)
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Compile shaders and program
  const program = createProgram(gl);
  gl.useProgram(program);

  // Setup fullscreen quad
  const positionLoc = gl.getAttribLocation(program, 'a_position');
  const texCoordLoc = gl.getAttribLocation(program, 'a_texCoord');
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(texCoordLoc);
  gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

  // Upload image as texture
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);

  // gl.uniform1f(gl.getUniformLocation(program, 'u_threshold'), 0.31);

  // Draw the quad
  gl.viewport(0, 0, width, height);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Convert canvas to blob
  return new Promise((resolve) => canvas.toBlob((outBlob) => resolve(outBlob), 'image/png'));
}

function fetchImageAsBlob(url: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      responseType: 'blob',
      onload: function (response) {
        if (response.status >= 200 && response.status < 300) {
          resolve(response.response); // response.response is the Blob
        } else {
          reject(new Error(`Failed to fetch image. Status: ${response.status}`));
        }
      },
      onerror: function (error) {
        reject(new Error(`Network error: ${error.error}`));
      }
    });
  });
}

export async function invertImage(url: string): Promise<string> {
  try {
    const blob = await fetchImageAsBlob(url);
    const processedBlob = await processImage(blob);
    if (typeof processedBlob !== 'boolean') {
      // Convert to URL
      const imageURL = URL.createObjectURL(processedBlob);
      return imageURL;
    } else {
      return url;
    }
  } catch (e) {
    return url;
  }
}
