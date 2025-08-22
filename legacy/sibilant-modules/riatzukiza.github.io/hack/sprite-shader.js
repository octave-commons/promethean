// create Canvas element, or you could grab it from DOM
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

// optional: set width/height, default is 300/150
canvas.width = 640;
canvas.height = 480;

// retrieve WebGLRenderingContext
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');



const vertexShaderSource = `
uniform vec2 screenSize;        // width/height of screen
attribute vec2 spritePosition;  // position of sprite

void main() {
  vec4 screenTransform = 
      vec4(2.0 / screenSize.x, -2.0 / screenSize.y, -1.0, 1.0);
  gl_Position =
      vec4(spritePosition * screenTransform.xy + screenTransform.zw, 0.0, 1.0);
  gl_PointSize = 64.0;
}
`;

const fragmentShaderSource = `
uniform sampler2D spriteTexture;  // texture we are drawing

void main() {
  gl_FragColor = texture2D(spriteTexture, gl_PointCoord);
}
`;

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!status) {
    throw new TypeError(`couldn't compile shader:\n${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}


const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

const status = gl.getProgramParameter(shaderProgram, gl.LINK_STATUS);
if (!status) {
  throw new TypeError(`couldn't link shader program (status=${status}): ${gl.getProgramInfoLog(shaderProgram)}`);
}


gl.useProgram(shaderProgram);
gl.uniform2f(gl.getUniformLocation(shaderProgram, 'screenSize'), canvas.width, canvas.height);


const array = new Float32Array(1000);  // allow for 500 sprites
array[0] = 128;  // x-value
array[1] = 128;  // y-value

const glBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
gl.bufferData(gl.ARRAY_BUFFER, array, gl.DYNAMIC_DRAW);  // upload data


const loc = gl.getAttribLocation(shaderProgram, 'spritePosition');
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc,
    2,  // because it was a vec2
    gl.FLOAT,  // vec2 contains floats
    false,  // ignored
    0,   // each value is next to each other
    0);  // starts at start of array


const icon = document.getElementById('icon');
const glTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, glTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, icon);
gl.generateMipmap(gl.TEXTURE_2D);


// sneakily enable blending alpha
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


function draw(points=1) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, points);
  console.info('drawn');
}
draw();

let index = 2;
canvas.addEventListener('click', (ev) => {
  array[index] = ev.offsetX;
  array[index+1] = ev.offsetY;

  gl.bufferData(gl.ARRAY_BUFFER, array, gl.DYNAMIC_DRAW);  // upload data
  
  index += 2;
  draw(index/2);
});
