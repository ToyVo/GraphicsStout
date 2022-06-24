/* eslint no-unused-vars: ["warn", { "varsIgnorePattern": "(render)" }] */

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
    // get a convas
    let canvas = document.getElementById('drawArea');
    // get a webgl context
    let gl = canvas.getContext('webgl');
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
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {*} renderType method of rendering (triangles)
 * @param {*} offset offset used in drawarrays
 * @param {*} numVertex number of verticies in the shape
 * @param {*} fragShader the specific shader used
 */
function draw(gl, renderType, offset, numVertex, fragShader) {
    // shaders
    // vertex and fragment
    // program
    let program = createProgram(gl, vertexShader, fragShader);
    // bind program to data
    // get location of attribure variables
    let loc = gl.getAttribLocation(program, 'location');
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
 * @param {WebGLRenderingContext} gl WebGL graphics context
 */
function drawStar(gl) {
    // create buffer
    let buffer = gl.createBuffer();
    // bind it
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // create date
    let star = [
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
 * @param {WebGLRenderingContext} gl WebGL graphics context
 */
function drawHexagon(gl) {
    // create buffer
    let buffer = gl.createBuffer();
    // bind it
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // create date
    let hexagon = [];
    let vertexCount = 6;
    let radius = 0.5;
    for (let i = 0; i < vertexCount; i++) {
        hexagon.push(radius * Math.cos((i / vertexCount) * 2 * Math.PI));
        hexagon.push(radius * Math.sin((i / vertexCount) * 2 * Math.PI));
    }
    // buffer the data
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hexagon), gl.STATIC_DRAW);

    draw(gl, gl.TRIANGLE_FAN, 0, 6, blueFragmentShader);
}

/**
 * Draws a circle in the graphics context
 * @param {WebGLRenderingContext} gl WebGL graphics context
 */
function drawCircle(gl) {
    // create buffer
    let buffer = gl.createBuffer();
    // bind it
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // create date
    let circle = [];
    let vertexCount = 20;
    let radius = 0.25;
    for (let i = 0; i < vertexCount; i++) {
        circle.push(radius * Math.cos((i / vertexCount) * 2.0 * Math.PI));
        circle.push(radius * Math.sin((i / vertexCount) * 2.0 * Math.PI));
    }
    // buffer the data
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circle), gl.STATIC_DRAW);

    draw(gl, gl.TRIANGLE_FAN, 0, vertexCount, redFragmentShader);
}

/**
 * loads compiles and returns shaders for use
 * @param {WebGLRenderingContext} gl webgl context
 * @param {string} src shader source code
 * @param {*} type type of shader (vertex or fragment)
 */
function loadShader(gl, src, type) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader did not compile');
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/**
 *	creates and returns the program
 * @param {WebGLRenderingContext} gl webgl context
 * @param {*} vertexSrc vertex shader source
 * @param {*} fragmentSrc fragment shader source
 */
function createProgram(gl, vertexSrc, fragmentSrc) {
    // create shaders
    let vertex = loadShader(gl, vertexSrc, gl.VERTEX_SHADER);
    let fragment = loadShader(gl, fragmentSrc, gl.FRAGMENT_SHADER);

    // create program
    let program = gl.createProgram();

    // attach shaders
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);

    // link the program
    gl.linkProgram(program);

    // check the results
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program did not link');
        gl.deleteProgram();

        return null;
    }

    return program;
}
