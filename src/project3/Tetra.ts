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
		this.program = createProgram(gl, vertex, fragment);
	}
}
