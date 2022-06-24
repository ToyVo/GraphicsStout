/* eslint no-unused-vars: ["warn", {"varsIgnorePattern": "Square"}] */
/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} src
 * @param {*} type
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
 *
 * @param {WebGLRenderingContext} gl
 * @param {*} vertexSrc
 * @param {*} fragmentSrc
 */
function createProgram(gl, vertexSrc, fragmentSrc) {
    // create the shaders
    let vertex = loadShader(gl, vertexSrc, gl.VERTEX_SHADER);
    let fragment = loadShader(gl, fragmentSrc, gl.FRAGMENT_SHADER);

    // create the program
    let program = gl.createProgram();

    // attach the shaders
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

const shapeVertexShader = `
attribute vec4 location;
uniform mat4 model;

void main() {
    gl_Position = model * location;
}
`;

const shapeFragmentShader = `
precision lowp float;

uniform vec4 color;

void main() {
    gl_FragColor = color;
}
`;

let shapeProgram = null;

class Shape {
    /**
    *
    * @param {WebGLRenderingContext} gl
    */
    constructor(gl) {
        this.location = {
            x: 0,
            y: 0,
            z: 0
        };
        this.vertices = [];
        this.vertexSize = 3;
        this.buffer = null;
        this.bufferType = gl.ARRAY_BUFFER;
        this.rotation = 0;
        this.size = {
            width: 1,
            height: 1
        };
        this.color = new Float32Array([0, 0, 0, 1]);
    }

    getLocation() {
        return this.location;
    }

    setLocation(x, y, z) {
        this.location.x = x;
        this.location.y = y;
        this.location.z = z;
    }

    getColor() {
        return this.color;
    }

    setColor(nColors) {
        this.color = new Float32Array(nColors);
    }

    /**
    *
    * @param {WebGLRenderingContext} gl
    */
    draw(gl) {
        // create shaders and programs
        if (!shapeProgram) {
            shapeProgram = createProgram(gl, shapeVertexShader, shapeFragmentShader);
        }
        //   cache them?
        // buffer my data
        gl.bindBuffer(this.bufferType, this.buffer);
        // bind data
        let loc = gl.getAttribLocation(shapeProgram, 'location');
        gl.vertexAttribPointer(loc, this.vertexSize, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc);

        // set the color
        let col = gl.getUniformLocation(shapeProgram, 'color');
        let model = gl.getUniformLocation(shapeProgram, 'model');

        gl.useProgram(shapeProgram);
        gl.uniform4fv(col, this.color);

        let cos = Math.cos(21 * Math.PI / 180);
        let sin = Math.sin(21 * Math.PI / 180);
        let transform = [
            cos, sin, 0, 0,
            -sin, cos, 0, 0,
            0, 0, 1, 0,
            this.location.x, this.location.y, this.location.z, 1
        ];

        gl.uniformMatrix4fv(model, false, transform);

        // draw data
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / this.vertexSize);
    }
}

class Square extends Shape {
    /**
    *
    * @param {WebGLRenderingContext} gl
    */
    constructor(gl) {
        super(gl);

        this.vertices = [
            -0.5, 0.5, 0,
            -0.5, -0.5, 0,
            0.5, 0.5, 0,
            0.5, 0.5, 0,
            -0.5, -0.5, 0,
            0.5, -0.5, 0
        ];

        // create the buffer
        this.buffer = gl.createBuffer();
        // bind it
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        // buffer the data
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    }
}
