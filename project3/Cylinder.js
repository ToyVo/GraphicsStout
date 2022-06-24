/* global  Shape createProgram vertex fragment Matrix */
/* eslint no-unused-vars: ["warn", { "varsIgnorePattern": "Cylinder" }] */

class Cylinder extends Shape {
    /**
	 * Cylinder Contructor
	 * @param {number} sides number of sides on the cylinder
	 */
    constructor(sides) {
        super();

        // Generate verticies
        let vertices = [];
        // Bottom Circle
        let radius = 0.5;
        for (let i = 0; i < sides; i++) {
            vertices.push(radius * Math.cos((i / sides) * 2.0 * Math.PI));
            vertices.push(0);
            vertices.push(radius * Math.sin((i / sides) * 2.0 * Math.PI));
        }
        // top circle
        for (let i = sides - 1; i >= 0; i--) {
            vertices.push(radius * Math.cos((i / sides) * 2.0 * Math.PI));
            vertices.push(1);
            vertices.push(radius * Math.sin((i / sides) * 2.0 * Math.PI));
        }
        // push verticies into the array used for buffers
        this.vertices = new Float32Array(vertices);

        // Generate triangles
        let triangles = [];
        // top and bottom cirles
        for (let i = 0; i < sides * 2; i++) {
            triangles.push(i);
        }
        // side triangles
        for (let i = 0; i < sides; i++) {
            triangles.push(i);
            triangles.push(sides * 2 - i - 1);
        }
        triangles.push(0);
        triangles.push(sides * 2 - 1);
        // push into proper array
        this.triangles = new Uint8Array(triangles);

        // generate edges
        let edges = [];
        // bottom
        for (let i = 0; i < sides; i++) {
            edges.push(i);
            edges.push(i + 1);
        }
        edges.pop();
        edges.push(0);
        // top
        for (let i = sides; i < sides * 2; i++) {
            edges.push(i);
            edges.push(i + 1);
        }
        edges.pop();
        edges.push(sides);
        // sides
        for (let i = 0; i < sides; i++) {
            edges.push(i);
            edges.push(sides * 2 - 1 - i);
        }
        edges.push(0);
        this.edges = new Uint8Array(edges);

        super.generateVerticesColors();
        super.generateEdgeColors();
        this.center = new Matrix().translate(0, -0.25, 0).scale(0.5, 0.5, 0.5);
    }

    /**
	 * creates program and buffers data
	 * @param {WebGLRenderingContext} gl webGL Context
	 */
    bufferData(gl) {
        super.bufferData(gl);
        this.program = createProgram(gl, vertex, fragment);
    }

    /**
	 * renders shapes
	 * @param {WebGLRenderingContext} gl webGL context
	 * @param {Matrix} projection current projection
	 * @param {Matrix} view current view
	 */
    render(gl, projection, view) {
        if (!this.buffered) {
            this.bufferData(gl);
        }

        let verLoc = gl.getAttribLocation(this.program, 'location');
        let colorsLoc = gl.getAttribLocation(this.program, 'color');
        let matProjection = gl.getUniformLocation(this.program, 'projection');
        let matModel = gl.getUniformLocation(this.program, 'model');
        let matView = gl.getUniformLocation(this.program, 'view');

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

        if (!this.wire) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
            gl.drawElements(gl.TRIANGLE_FAN, (this.triangles.length - 2) / 4, gl.UNSIGNED_BYTE, 0);
            gl.drawElements(gl.TRIANGLE_FAN, (this.triangles.length - 2) / 4, gl.UNSIGNED_BYTE, (this.triangles.length - 2) / 4);
            gl.drawElements(gl.TRIANGLE_STRIP, (this.triangles.length - 2) / 2 + 2, gl.UNSIGNED_BYTE, (this.triangles.length - 2) / 2);
        }

        // wire frame
        gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeColorsBuffer);
        gl.vertexAttribPointer(colorsLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorsLoc);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgesBuffer);
        gl.drawElements(gl.LINES, this.edges.length, gl.UNSIGNED_BYTE, 0);
    }
}
