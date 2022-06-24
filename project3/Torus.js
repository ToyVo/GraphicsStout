/* global  Shape createProgram vertex fragment Matrix */
/* eslint no-unused-vars: ["warn", { "varsIgnorePattern": "Torus" }] */

class Torus extends Shape {
    /**
	 * Torus Contructor
	 */
    constructor() {
        super();

        // Generate verticies
        let vertices = [];
        this.vertices = new Float32Array(vertices);

        // Generate triangles
        let triangles = [];
        this.triangles = new Uint8Array(triangles);

        // generate edges
        let edges = [];
        this.edges = new Uint8Array(edges);

        super.generateVerticesColors();
        super.generateEdgeColors();
        this.center = new Matrix().scale(0.5, 0.5, 0.5);
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
