/* global  Shape createProgram vertex fragment Matrix Vector */
/* eslint no-unused-vars: ["warn", { "varsIgnorePattern": "Sphere" }] */

class Sphere extends Shape {
    /**
	 * Shpere Contructor
	 */
    constructor(numTimesToSubdivide) {
        super();
        let vertices = [];
        let edges = [];

        // Staring triangles/vertices
        vertices.push(
            1, 0, 0, // face 0
            0, 1, 0,
            0, 0, 1,
            1, 0, 0, // face 1
            0, 0, -1,
            0, 1, 0,
            1, 0, 0, // face 2
            0, 0, 1,
            0, -1, 0,
            1, 0, 0, // face 3
            0, -1, 0,
            0, 0, -1,
            -1, 0, 0, // face 4
            0, 0, 1,
            0, 1, 0,
            -1, 0, 0, // face 5
            0, 1, 0,
            0, 0, -1,
            -1, 0, 0, // face 6
            0, -1, 0,
            0, 0, 1,
            -1, 0, 0, // face 7
            0, 0, -1,
            0, -1, 0,
        );

        // Generate verticies
        for (let divisionNumber = 1; divisionNumber < numTimesToSubdivide; divisionNumber++) {
            let newVertices = [];
            for (let i = 0; i < vertices.length; i += 9) {
                let A = new Vector([vertices[i], vertices[i+1], vertices[i+2]]);
                let B = new Vector([vertices[i+3], vertices[i+4], vertices[i+5]]);
                let C = new Vector([vertices[i+6], vertices[i+7], vertices[i+8]]);
                let AB = findMidpoint(A, B);
                let AC = findMidpoint(A, C);
                let BC = findMidpoint(B, C);
                AB.normalize();
                AC.normalize();
                BC.normalize();
                newVertices.push(A.getX(), A.getY(), A.getZ(), AB.getX(), AB.getY(), AB.getZ(), AC.getX(), AC.getY(), AC.getZ(),
                    AB.getX(), AB.getY(), AB.getZ(), B.getX(), B.getY(), B.getZ(), BC.getX(), BC.getY(), BC.getZ(),
                    BC.getX(), BC.getY(), BC.getZ(), C.getX(), C.getY(), C.getZ(), AC.getX(), AC.getY(), AC.getZ(),
                    AB.getX(), AB.getY(), AB.getZ(), BC.getX(), BC.getY(), BC.getZ(), AC.getX(), AC.getY(), AC.getZ());
            }
            vertices = newVertices;
        }

        console.log(vertices);
        this.vertices = new Float32Array(vertices);

        // generate edges
        for (let i = 0; i < vertices.length/3; i += 3) {
            edges.push(i, i + 1);
            edges.push(i, i + 2);
            edges.push(i + 1, i + 2);
        }
        this.edges = new Uint8Array(edges);

        super.generateVerticesColors();
        super.generateEdgeColors();
        this.center = new Matrix().scale(0.5, 0.5, 0.5);

        /**
         *
         * @param {Vector} A
         * @param {Vector} B
         * @returns {Vector}
         */
        function findMidpoint(A, B) {
            let x = (A.getX() + B.getX()) / 2;
            let y = (A.getY() + B.getY()) / 2;
            let z = (A.getZ() + B.getZ()) / 2;
            return new Vector([x, y, z]);
        }
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
            gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length/3);
        }

        // wire frame
        gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeColorsBuffer);
        gl.vertexAttribPointer(colorsLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorsLoc);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgesBuffer);
        //gl.drawElements(gl.LINES, this.edges.length, gl.UNSIGNED_BYTE, 0);
    }
}
