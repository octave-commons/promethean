'use strict';

/* global document, window, twgl, m3 */

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

const vs = `
attribute vec2 a_position;
uniform mat3 u_matrix;
void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}
`;

const fs = `
precision mediump float;
uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}
`;

// compiles shaders, links program, looks up locations
const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

// calls gl.createBuffer, gl.bindBuffer, gl.bufferData
const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
  a_position: {
    numComponents: 2,
    data: [
       0,  0, // 0----1
      40,  0, // |    |
      40, 10, // | 3--2
      10, 10, // | |
      10, 20, // | 4-5
      30, 20, // |   |
      30, 30, // | 7-6
      10, 30, // | |
      10, 50, // 9-8
       0, 50,
    ],
  },
  indices: [
    0, 1, 2,
    0, 2, 3,
    0, 3, 8,
    0, 8, 9,
    4, 5, 6,
    4, 6, 7,
  ],
});

const sphereVerts = twgl.primitives.createSphereVertices(1, 24, 12);
const sphereBufferInfo = twgl.createBufferInfoFromArrays(gl, {
  a_position: sphereVerts.position,
  indices: sphereVerts.indices,
});

const camera = {
  x: 0,
  y: 0,
  rotation: 0,
  zoom: 1,
};

const scene = [
  { x:  20, y:  20, rotation: 0,       scale: 1,   color: [1,   0, 0, 1], bufferInfo},
  { x: 100, y:  50, rotation: Math.PI, scale: 0.5, color: [0, 0.5, 0, 1], bufferInfo},
  { x: 100, y:  50, rotation: 0,       scale: 2,   color: [0,   0, 1, 1], bufferInfo},
  { x: 200, y: 100, rotation: 0.7,     scale: 1,   color: [1,   0, 1, 1], bufferInfo},
];

let viewProjectionMat;

function makeCameraMatrix() {
  const zoomScale = 1 / camera.zoom;
  let cameraMat = m3.identity();
  cameraMat = m3.translate(cameraMat, camera.x, camera.y);
  cameraMat = m3.rotate(cameraMat, camera.rotation);
  cameraMat = m3.scale(cameraMat, zoomScale, zoomScale);
  return cameraMat;
}

function updateViewProjection() {
  // same as ortho(0, width, height, 0, -1, 1)
  const projectionMat = m3.projection(gl.canvas.width, gl.canvas.height);
  const cameraMat = makeCameraMatrix();
  let viewMat = m3.inverse(cameraMat);
  viewProjectionMat = m3.multiply(projectionMat, viewMat);
}

function drawThing(thing) {
  const {x, y, rotation, scale, color, bufferInfo} = thing;
  
  // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

  let mat = m3.identity();
  mat = m3.translate(mat, x, y);
  mat = m3.rotate(mat, rotation);
  mat = m3.scale(mat, scale, scale);

  // calls gl.uniformXXX
  twgl.setUniforms(programInfo, {
    u_matrix: m3.multiply(viewProjectionMat, mat),
    u_color: color,
  });

  // calls gl.drawArrays or gl.drawElements
  twgl.drawBufferInfo(gl, bufferInfo);
}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  updateViewProjection();
    
  gl.useProgram(programInfo.program);

  scene.forEach(drawThing);
  
  if (rotate) {
    drawThing({
    	x: startPos[0],
      y: startPos[1],
      rotation: 0,
      scale: 5 / camera.zoom,
      color: [0, 0, 0, 1],
      bufferInfo: sphereBufferInfo,
    });
  }
}

function getClipSpaceMousePosition(e) {
  // get canvas relative css position
  const rect = canvas.getBoundingClientRect();
  const cssX = e.clientX - rect.left;
  const cssY = e.clientY - rect.top;
  
  // get normalized 0 to 1 position across and down canvas
  const normalizedX = cssX / canvas.clientWidth;
  const normalizedY = cssY / canvas.clientHeight;

  // convert to clip space
  const clipX = normalizedX *  2 - 1;
  const clipY = normalizedY * -2 + 1;
  
  return [clipX, clipY];
}

let startInvViewProjMat;
let startCamera;
let startPos;
let startClipPos;
let startMousePos;
let rotate;

function moveCamera(e) {
  const pos = m3.transformPoint(
			startInvViewProjMat,
      getClipSpaceMousePosition(e));
	
  camera.x = startCamera.x + startPos[0] - pos[0];
  camera.y = startCamera.y + startPos[1] - pos[1];
  draw();
}

function rotateCamera(e) {
	const delta = (e.clientX - startMousePos[0]) / 100;

  // compute a matrix to pivot around the camera space startPos
  let camMat = m3.identity();
  camMat = m3.translate(camMat, startPos[0], startPos[1]);
  camMat = m3.rotate(camMat, delta);
  camMat = m3.translate(camMat, -startPos[0], -startPos[1]);
  
  // multply in the original camera matrix
  Object.assign(camera, startCamera);
  camMat = m3.multiply(camMat, makeCameraMatrix());

	// now we can set the rotation and get the needed
  // camera position from the matrix
  camera.rotation = startCamera.rotation + delta;  
  camera.x = camMat[6];
  camera.y = camMat[7];

  draw();
}

function handleMouseMove(e) {
  if (rotate) {
		rotateCamera(e);
  } else {
    moveCamera(e);
  }
}

function handleMouseUp(e) {
  rotate = false;
  draw();
	window.removeEventListener('mousemove', handleMouseMove);
	window.removeEventListener('mouseup', handleMouseUp);
}

canvas.addEventListener('mousedown', (e) => {
  e.preventDefault();
	window.addEventListener('mousemove', handleMouseMove);
	window.addEventListener('mouseup', handleMouseUp);

  rotate = e.shiftKey;
  startInvViewProjMat = m3.inverse(viewProjectionMat);
  startCamera = Object.assign({}, camera);
  startClipPos = getClipSpaceMousePosition(e);
  startPos = m3.transformPoint(
			startInvViewProjMat,
      startClipPos);
  startMousePos = [e.clientX, e.clientY];
  draw();
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();  
  const [clipX, clipY] = getClipSpaceMousePosition(e);
  
  // position before zooming
  const [preZoomX, preZoomY] = m3.transformPoint(
      m3.inverse(viewProjectionMat), 
      [clipX, clipY]);
    
  // multiply the wheel movement by the current zoom level
  // so we zoom less when zoomed in and more when zoomed out
  const newZoom = camera.zoom * Math.pow(2, e.deltaY * -0.01);
  camera.zoom = Math.max(0.02, Math.min(100, newZoom));
  
  updateViewProjection();
  
  // position after zooming
  const [postZoomX, postZoomY] = m3.transformPoint(
      m3.inverse(viewProjectionMat), 
      [clipX, clipY]);

  // camera needs to be moved the difference of before and after
  camera.x += preZoomX - postZoomX;
  camera.y += preZoomY - postZoomY;  
  
  draw();
});

draw();
