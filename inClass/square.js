/* eslint no-unused-vars: ["warn", {"varsIgnorePattern": "(render)|(display)"}] */
/* global Square */

// attribute - getting values from a buffer
// uniform - stay the same for the entire buffer
// varying - connects vertex and fragment shader
// const - constant

// float, int, bool
// vec[234], ivec[234], bvec[234]
// mat[234]
// const vertexShader = `
//     attribute vec4 location;
//     attribute vec4 color;

//     varying vec4 fColor;

//     void main() {
//         gl_Position = location;
//         fColor = color;
//     }
// `;

function render() {
    // get a canvas
    let canvas = document.getElementById('drawArea');
    // get a WebGL context
    let gl = canvas.getContext('webgl');
    // size?
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientWidth;

    gl.viewport(0, 0, canvas.width, canvas.height);
    // clear the background
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0, 0.75, 1, 1);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawSquare(gl);
}

let sq = null;
let glContext = null;
let speed = { x: 0.005, y: 0.002, z: 0 };

/**
 * Draws a square in the graphics context
 * @param {WebGLRenderingContext} gl WebGL graphics context
 */
function drawSquare(gl) {
    sq = new Square(gl);
    sq.setColor([0, 0, 1, 1]);
    sq.setLocation(0.1, 0.3, 0.7);
    glContext = gl;
    requestAnimationFrame(animateSquare);
    // sq.draw(gl);

    // let sq2 = new Square(gl);
    // sq2.setColor([1, 0, 1, 1]);
    // sq2.setLocation(-0.1, -0.4, -0.9);
    // // glContext = gl;
    // // requestAnimationFrame(animateSquare);
    // sq2.draw(gl);

    // let sq2 = new Square(gl);
    // sq2.setColor([1, 0, 0, 1]);
    // sq2.setLocation(-0.25, 0.1, -0.5);
    // sq2.draw(gl);

    // // create buffer
    // let buffer = gl.createBuffer();
    // // bind it
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // // create data
    // let square = [
    //     -0.5, 0.5,
    //     -0.5, -0.5,
    //     0.5, 0.5,
    //     0.5, -0.5
    // ];
    // // square.push(x, y);
    // // buffer the data
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square), gl.STATIC_DRAW);

    // // shaders
    // //  vertex and fragment
    // // program
    // let program = createProgram(gl, vertexShader,
    //     document.getElementById("squareFragment").innerText);
    // // bind program to my data
    // // get the location of attribute variables
    // let loc = gl.getAttribLocation(program, "location");

    // // bind
    // gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    // // enable
    // gl.enableVertexAttribArray(loc);

    // let colorBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // let colors = [
    //     0, 0, 1.0, 1,
    //     0.2, 0.3, 0.7, 1,
    //     0.4, 0.6, 0.2, 1,
    //     0, 0, 0, 1
    // ];
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // let colorIndex = gl.getAttribLocation(program, "color");
    // gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(colorIndex);

    // // use program
    // gl.useProgram(program);

    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function animateSquare() {
    glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);

    // move the square
    let loc = sq.getLocation();
    // add bounce
    if (loc.x > 0.5 || loc.x < -0.5) {
        speed.x *= -1;
    }
    if (loc.y > 0.5 || loc.y < -0.5) {
        speed.y *= -1;
    }
    // time?
    sq.setLocation(loc.x + speed.x, loc.y + speed.y,
        loc.z + speed.z);
    // draw the square
    sq.draw(glContext);
    // request another frame
    requestAnimationFrame(animateSquare);
}
