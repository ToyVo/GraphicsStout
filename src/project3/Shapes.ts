import Matrix from '../Matrix';

/**
 * vertex shader
 */
const vertex = `
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
const fragment = `
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
		this.center = new Matrix().translate(-0.25, -0.25, -0.25).scale(0.5, 0.5, 0.5);

		this.buffered = false;
	}

	/**
	 * Creates the buffers for the program. Intended for internal use.
	 * in derived classes a program should be created after super.bufferData(gl) is called
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
		return this.translateMatrix.mult(this.rotateMatrix).mult(this.scaleMatrix).mult(this.center).mult(this.model);
	}

	/**
	 * generates random colors for every vertice in a shape
	 */
	generateVerticesColors() {
		// generate colors
		const colors = [];
		for(let i = 0; i < this.vertices.length; i++) {
			colors.push(Math.random(), Math.random(), Math.random(), 1);
		}
		this.colors = new Float32Array(colors);
	}

	/**
	 * assigns black to every edgeColor
	 */
	generateEdgeColors() {
		// gererate edge colors
		const edgeColors = [];
		for(let i = 0; i < this.edges.length; i++) {
			edgeColors.push(0, 0, 0, 1);
		}
		this.edgeColors = new Float32Array(edgeColors);
	}
}
