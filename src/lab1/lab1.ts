import {createProgram} from '../program';

// -------------- Shaders -------------------
// Vertex Shader
const vertexShader = `
	attribute vec4 location;

	void main() {
		gl_Position = location;
	}
`;
// Fragment Shader
const greenFragmentShader = `
	void main() {
		gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
	}
`;
// Fragment Shader
const redFragmentShader = `
	void main() {
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	}
`;
// Fragment Shader
const blueFragmentShader = `
	void main() {
		gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
	}
`;

/**
 * Sets up the canvas and the context and calls functions to draw each shape
 */
function render() {
	// get a canvas
	const canvas: HTMLCanvasElement = document.createElement('canvas');
	document.body.appendChild(canvas);
	// get a webgl context
	const gl = canvas.getContext('webgl');
	if(!gl) {
		throw new Error('Could not get webgl context');
	}
	// size
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;

	gl.viewport(0, 0, canvas.width, canvas.height);
	// clear background
	gl.clearColor(1, 0, 0, 1);
	gl.clearDepth(1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	drawStar(gl);
	drawHexagon(gl);
	drawCircle(gl);

}

/**
 * Common code involved in drawing objects
 * @param gl
 * @param renderType method of rendering (triangles)
 * @param offset offset used in drawArrays
 * @param numVertex number of vertices in the shape
 * @param fragShader the specific shader used
 */
function draw(gl: WebGLRenderingContext, renderType: GLenum, offset: number, numVertex: number, fragShader: string) {
	// shaders
	// vertex and fragment
	// program
	const program = createProgram(gl, vertexShader, fragShader);
	// bind program to data
	// get location of attribute variables
	const loc = gl.getAttribLocation(program, 'location');
	// bind
	gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
	// enable
	gl.enableVertexAttribArray(loc);
	// use program
	gl.useProgram(program);

	gl.drawArrays(renderType, offset, numVertex);
}

/**
 * Draws a star in the graphics context
 * @param gl WebGL graphics context
 */
function drawStar(gl: WebGLRenderingContext) {
	// create buffer
	const buffer = gl.createBuffer();
	// bind it
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	// create date
	const star = [
		0.0, 1.0,
		-0.5, -0.8,
		0.3, -0.1,
		0.0, 1.0,
		0.5, -0.8,
		-0.3, -0.1,
		-0.9, 0.3,
		0.9, 0.3,
		0.0, -0.3
	];
	// buffer the data
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(star), gl.STATIC_DRAW);

	draw(gl, gl.TRIANGLES, 0, 9, greenFragmentShader);
}

/**
 * Draws a hexagon in the graphics context
 * @param gl WebGL graphics context
 */
function drawHexagon(gl: WebGLRenderingContext) {
	// create buffer
	const buffer = gl.createBuffer();
	// bind it
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	// create date
	const hexagon = [];
	const vertexCount = 6;
	const radius = 0.5;
	for(let i = 0; i < vertexCount; i++) {
		hexagon.push(radius * Math.cos((i / vertexCount) * 2 * Math.PI));
		hexagon.push(radius * Math.sin((i / vertexCount) * 2 * Math.PI));
	}
	// buffer the data
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hexagon), gl.STATIC_DRAW);

	draw(gl, gl.TRIANGLE_FAN, 0, 6, blueFragmentShader);
}

/**
 * Draws a circle in the graphics context
 * @param gl WebGL graphics context
 */
function drawCircle(gl: WebGLRenderingContext) {
	// create buffer
	const buffer = gl.createBuffer();
	// bind it
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	// create date
	const circle = [];
	const vertexCount = 20;
	const radius = 0.25;
	for(let i = 0; i < vertexCount; i++) {
		circle.push(radius * Math.cos((i / vertexCount) * 2.0 * Math.PI));
		circle.push(radius * Math.sin((i / vertexCount) * 2.0 * Math.PI));
	}
	// buffer the data
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circle), gl.STATIC_DRAW);

	draw(gl, gl.TRIANGLE_FAN, 0, vertexCount, redFragmentShader);
}

render();
