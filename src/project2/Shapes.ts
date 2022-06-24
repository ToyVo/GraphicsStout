/**
 * vertex shader
 */
const cubeVertex = `
    attribute vec4 location;
    attribute vec4 color;

    uniform mat4 model;
	uniform mat4 projection;
	uniform mat4 view;

    varying lowp vec4 cColor;

    void main() {
       gl_Position = projection * view * model * location;
       cColor = color;
    }
`;

const tetraVertex = `
    attribute vec4 location;
    attribute vec4 color;

    uniform mat4 model;
	uniform mat4 projection;
	uniform mat4 view;

    varying lowp vec4 cColor;

    void main() {
       gl_Position = projection * view * model * location;
       cColor = color;
    }
`;

/**
 * fragment shader
 */
const cubeFragment = `
    precision lowp float;
    varying lowp vec4 cColor;

    void main() {
        gl_FragColor = cColor;
    }
`;

const tetraFragment = `
    precision lowp float;
    varying lowp vec4 cColor;

    void main() {
        gl_FragColor = cColor;
    }
`;

class Shape {
	private program: WebGLProgram;

	/**
	 * generic shape constructor
	 */
	constructor() {
		this.size = [1, 1, 1];
		this.location = [0, 0, 0];
		this.orientation = [0, 0, 0];

		this.wire = false;
		this.program;

		// vertices
		this.vertices = new Float32Array([]);

		// triangles
		this.triangles = new Uint8Array([]);

		// colors
		this.colors = new Float32Array([]);

		// edges
		this.edges = new Uint8Array([]);

		// edge colors
		this.edgeColors = new Float32Array([]);

		// create identity matrices for each transformation
		this.scaleMatrix = new Matrix(); // scale matrix
		this.rotateMatrix = new Matrix(); // rotate matrix
		this.translateMatrix = new Matrix(); // translate
		// create identity matrix for the model
		this.model = new Matrix(); // model matrix
		this.buffered = false;
	}

	/**
	 * Creates the buffers for the program. Intended for internal use.
	 *
	 * @param {WebGLRenderingContext} gl WebGL context
	 */
	bufferData(gl) {
		this.verticesBuffer = gl.createBuffer();
		this.trianglesBuffer = gl.createBuffer();
		this.colorsBuffer = gl.createBuffer();
		this.edgesBuffer = gl.createBuffer();
		this.edgeColorsBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.triangles, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.edges, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeColorsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.edgeColors, gl.STATIC_DRAW);

		this.buffered = true;
	}

	/**
	 * renders shapes
	 * @param {WebGLRenderingContext} gl webGL context
	 * @param {Matrix} projection current projection
	 * @param {Matrix} view current view
	 */
	render(gl, projection, view) {
		if(!this.buffered) {
			this.bufferData(gl);
		}

		const verLoc = gl.getAttribLocation(this.program, 'location');
		const colorsLoc = gl.getAttribLocation(this.program, 'color');
		const matProjection = gl.getUniformLocation(this.program, 'projection');
		const matModel = gl.getUniformLocation(this.program, 'model');
		const matView = gl.getUniformLocation(this.program, 'view');

		// location
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.vertexAttribPointer(verLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(verLoc);

		// color
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
		gl.vertexAttribPointer(colorsLoc, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(colorsLoc);

		gl.useProgram(this.program);

		gl.uniformMatrix4fv(matProjection, false, projection.getData());
		gl.uniformMatrix4fv(matModel, false, this.getModel().getData());
		gl.uniformMatrix4fv(matView, false, view.getData());

		if(!this.wire) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
			gl.drawElements(gl.TRIANGLE_STRIP, this.triangles.length, gl.UNSIGNED_BYTE, 0);
		}

		// wire frame
		gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeColorsBuffer);
		gl.vertexAttribPointer(colorsLoc, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(colorsLoc);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgesBuffer);
		gl.drawElements(gl.LINES, this.edges.length, gl.UNSIGNED_BYTE, 0);
	}

	/**
	 * move the shape
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 */
	move(x, y, z) {
		this.translateMatrix = new Matrix();
		this.translateMatrix = this.translateMatrix.translate(x, y, z);
		this.location = [this.location[0] + x, this.location[1] + y, this.location[2] + z];
	}

	/**
	 * returns the current location
	 * @returns {Array} current location
	 */
	getLocation() {
		return this.location;
	}

	/**
	 * resize the shape
	 * @param {Number} w width
	 * @param {Number} h height
	 * @param {Number} d depth
	 */
	resize(w, h, d) {
		this.scaleMatrix = new Matrix();
		this.scaleMatrix = this.scaleMatrix.scale(w, h, d);
		this.size = [this.size[0] * w, this.size[1] * h, this.size[2] * d];
	}

	/**
	 * returns the current size
	 * @returns {Array} current size
	 */
	getSize() {
		return this.size;
	}

	/**
	 * rotate shape
	 * @param {Number} tx degrees x
	 * @param {Number} ty degrees y
	 * @param {Number} tz degrees z
	 */
	orient(tx, ty, tz) {
		this.rotateMatrix = new Matrix();
		this.rotateMatrix = this.rotateMatrix.rotate(tx, ty, tz);
		this.orientation = [this.orientation[0] + tx, this.orientation[1] + ty, this.orientation[2] + tz];
	}

	/**
	 * returns the current orientation
	 * @returns {Array} current orientation
	 */
	getOrientation() {
		return this.orientation;
	}

	/**
	 * Creates a model matrix by combining the other matrices. The matrices should be applied
	 * in the order:
	 *  view
	 *  scaleMatrix
	 *  rotateMatrix
	 *  translateMatrix
	 *
	 * @return {Matrix} A matrix with all of the transformations applied to the cube.
	 */
	getModel() {
		return this.translateMatrix.mult(this.rotateMatrix).mult(this.scaleMatrix).mult(this.model);
	}
}

class Cube extends Shape {
	/**
	 * Cube Contructor
	 */
	constructor() {
		super();

		// vertices
		this.vertices = new Float32Array([
			0, 0, 0,
			1, 0, 0,
			0, 1, 0,
			0, 0, 1,
			1, 1, 0,
			1, 0, 1,
			0, 1, 1,
			1, 1, 1
		]);

		// triangles
		this.triangles = new Uint8Array([
			0, 1, 3, 5, // bottom
			6, 7, // front
			2, 4, // top
			0, 1, // back
			1, 4, 5, 7, // right
			6, 2, 3, 0 // left
		]);

		// colors
		this.colors = new Float32Array([
			0, 0, 0, 1, // black
			1, 0, 0, 1, // red
			0, 1, 0, 1, // grean
			0, 0, 1, 1, // blue
			1, 1, 0, 1, // yellow
			1, 0, 1, 1, // magenta
			0, 1, 1, 1, // cyan
			1, 1, 1, 1 // white
		]);

		// edges
		this.edges = new Uint8Array([
			0, 1,
			1, 4,
			4, 2,
			2, 0,
			3, 6,
			6, 7,
			7, 5,
			5, 3,
			0, 3,
			1, 5,
			2, 6,
			4, 7
		]);

		// edge colors
		this.edgeColors = new Float32Array([
			0, 0, 0, 1, // black
			0, 0, 0, 1, // black
			0, 0, 0, 1, // black
			0, 0, 0, 1, // black
			0, 0, 0, 1, // black
			0, 0, 0, 1, // black
			0, 0, 0, 1, // black
			0, 0, 0, 1 // black
		]);
	}

	/**
	 * creates program and buffers data
	 * @param {WebGLRenderingContext} gl webGL Context
	 */
	bufferData(gl) {
		super.bufferData(gl);
		this.program = createProgram(gl, cubeVertex, cubeFragment);
	}
}

class Tetra extends Shape {
	/**
	 * tetra contructor
	 */
	constructor() {
		super();

		// vertices
		this.vertices = new Float32Array([
			0, 0, 0,
			1, 1, 0,
			1, 0, 1,
			0, 1, 1
		]);

		// triangles
		this.triangles = new Uint8Array([
			0, 1, 2,
			3,
			0,
			1
		]);

		// colors
		this.colors = new Float32Array([
			0, 0, 0, 1, // black
			1, 0, 0, 1, // red
			0, 1, 0, 1, // grean
			0, 0, 1, 1 // blue
		]);

		// edges
		this.edges = new Uint8Array([
			0, 1,
			0, 2,
			0, 3,
			1, 2,
			1, 3,
			2, 3
		]);

		// edge colors
		this.edgeColors = new Float32Array([
			0, 0, 0, 1, // black
			0, 0, 0, 1, // black
			0, 0, 0, 1, // black
			0, 0, 0, 1, // black
			0, 0, 0, 1, // black
			0, 0, 0, 1 // black
		]);
	}

	/**
	 * create program and buffer data
	 * @param {WebGLRenderingContext} gl webGL context
	 */
	bufferData(gl) {
		super.bufferData(gl);
		this.program = createProgram(gl, tetraVertex, tetraFragment);
	}
}
