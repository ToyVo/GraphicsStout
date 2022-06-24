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

		super.generateVerticesColors();
		super.generateEdgeColors();
	}

	/**
	 * creates program and buffers data
	 * @param {WebGLRenderingContext} gl webGL Context
	 */
	bufferData(gl) {
		super.bufferData(gl);
		this.program = createProgram(gl, vertex, fragment);
	}
}
