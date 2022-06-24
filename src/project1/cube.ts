import Matrix from '../Matrix';

/**
 * vertex shader
 */
const cubeVertex = `
    attribute vec4 cubeLocation;
    attribute vec4 cubeColor;

    uniform mat4 model;
    uniform mat4 projection;

    varying lowp vec4 cColor;

    void main() {
       gl_Position = projection * model * cubeLocation;
       cColor = cubeColor;
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

/**
 * Creates a cube centered on the origin with a size of 0.5 units. The cube is
 * shaded to show the color gamut.
 */
export default class Cube {
	private program: WebGLProgram;
	private wire: boolean;
	private vertices: Float32Array;
	private triangles: Uint8Array;
	private colors: Float32Array;
	private edges: Uint8Array;
	private edgeColors: Float32Array;
	private scaleMatrix: Matrix;
	private rotateMatrix: Matrix;
	private translateMatrix: Matrix;
	private model: Matrix;
	private buffered: boolean;
	private view: Matrix;
	private trianglesBuffer: WebGLBuffer;
	private verticesBuffer: WebGLBuffer;
	private edgesBuffer: WebGLBuffer;
	private colorsBuffer: WebGLBuffer;
	private edgeColorsBuffer: WebGLBuffer;

	/**
	 * Creates a cube.
	 *
	 * @param gl WebGL Context
	 */
	constructor(gl: WebGLRenderingContext) {
		// shaders
		this.wire = false;
		this.program = createProgram(gl, cubeVertex, cubeFragment);
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
			0, 3, 1, 5, // bottom
			4, 7, // right
			2, 6, // top
			0, 3, // left
			5, 6, 7, // front
			4, 2, 1, 0 // back
		]);
		// colors
		this.colors = new Float32Array([
			0, 0, 0, 1, // black
			1, 0, 0, 1, // red
			0, 1, 0, 1, // green
			0, 0, 1, 1, // blue
			1, 1, 0, 1, // yellow
			1, 0, 1, 1, // magenta
			0, 1, 1, 1, // cyan
			1, 1, 1, 1 // white
		]);

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

		// move from model coordinates to world coordinates.
		// The cube is defined to be 1 unit is size with one corner on the origin
		// Move it so it is centered on the origin and scale it so it is half size.
		// Assign the value to this.view.
		this.view = new Matrix().translate(-0.25, -0.25, -0.25).scale(0.5, 0.5, 0.5);

		// create identity matrices for each transformation
		this.scaleMatrix = new Matrix(); // scale matrix
		this.rotateMatrix = new Matrix(); // rotate matrix
		this.translateMatrix = new Matrix(); // translate
		// create identity matrix for the model
		this.model = new Matrix(); // model matrix

		this.buffered = false;
		this.verticesBuffer = gl.createBuffer();
		this.trianglesBuffer = gl.createBuffer();
		this.colorsBuffer = gl.createBuffer();
		this.edgesBuffer = gl.createBuffer();
		this.edgeColorsBuffer = gl.createBuffer();
	}

	/**
	 * Creates the buffers for the program. Intended for internal use.
	 *
	 * @param gl WebGL context
	 */
	bufferData(gl: WebGLRenderingContext) {
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

	// render
	/**
	 * Draws a cube using the provided context and the projection
	 * matrix.
	 *
	 * @param {WebGLRenderingContext} gl WebGL context
	 * @param {Matrix} projection Projection matrix
	 */
	render(gl: WebGLRenderingContext, projection: Matrix) {
		if(!this.buffered) {
			this.bufferData(gl);
		}

		// Create bindings between the cube data and the shaders
		// bind verticesBuffer to the cubeLocation attribute (ARRAY_BUFFER)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		const cubeLoc = gl.getAttribLocation(this.program, 'cubeLocation');
		gl.vertexAttribPointer(cubeLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(cubeLoc);

		// bind colorsBuffer to the cubeColor attribute (ARRAY_BUFFER)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
		const colorsLoc = gl.getAttribLocation(this.program, 'cubeColor');
		gl.vertexAttribPointer(colorsLoc, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(colorsLoc);

		gl.useProgram(this.program);

		// bind projection (get its data as an array) to the projection uniform (it is a matrix)
		const projectionLoc = gl.getUniformLocation(this.program, 'projection');
		gl.uniformMatrix4fv(projectionLoc, false, projection.getData());

		// bind this.model (get its data as an array) to the model uniform (it is a matrix)
		const modelLoc = gl.getUniformLocation(this.program, 'model');
		gl.uniformMatrix4fv(modelLoc, false, this.getModel().getData());

		if(!this.wire) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
			gl.drawElements(gl.TRIANGLE_STRIP, this.triangles.length, gl.UNSIGNED_BYTE, 0);
		}

		// wire frame
		// bind edgeColorsBuffer to the cubeColor attribute (ARRAY_BUFFER)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeColorsBuffer);
		gl.vertexAttribPointer(colorsLoc, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(colorsLoc);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgesBuffer);
		gl.drawElements(gl.LINES, this.edges.length, gl.UNSIGNED_BYTE, 0);
	}

	/**
	 * Sets the this.scaleMatrix variable to a new scaling matrix that uses the
	 * parameters for the scaling information.
	 *
	 * @param sx Amount to scale the cube in the x direction
	 * @param sy Amount to scale the cube in the y direction
	 * @param sz Amount to scale the cube in the z direction
	 */
	scale(sx: number, sy: number, sz: number) {
		this.scaleMatrix = new Matrix();
		this.scaleMatrix = this.scaleMatrix.scale(sx, sy, sz);
	}

	/**
	 * Sets the this.rotateMatrix variable to a new rotation matrix that uses the
	 * parameters for the rotation information.
	 *
	 * @param xTheta Amount in degrees to rotate the cube around the x-axis
	 * @param yTheta Amount in degrees to rotate the cube around the y-axis
	 * @param zTheta Amount in degrees to rotate the cube around the z-axis
	 */
	rotate(xTheta: number, yTheta: number, zTheta: number) {
		this.rotateMatrix = new Matrix();
		this.rotateMatrix = this.rotateMatrix.rotate(xTheta, yTheta, zTheta);
	}

	/**
	 * Sets the this.translateMatrix variable to a new translation matrix that uses the
	 * parameters for the translation information.
	 *
	 * @param tx Amount to translate the cube in the x direction.
	 * @param ty Amount to translate the cube in the y direction.
	 * @param tz Amount to translate the cube in the z direction.
	 */
	translate(tx: number, ty: number, tz: number) {
		this.translateMatrix = new Matrix();
		this.translateMatrix = this.translateMatrix.translate(tx, ty, tz);
	}

	/**
	 * Creates a model matrix by combining the other matrices. The matrices should be applied
	 * in the order:
	 *  view
	 *  scaleMatrix
	 *  rotateMatrix
	 *  translateMatrix
	 *
	 * @return A matrix with all of the transformations applied to the cube.
	 */
	getModel(): Matrix {
		this.model = this.translateMatrix.mult(this.rotateMatrix).mult(this.scaleMatrix).mult(this.view);
		return this.model;
	}
}
