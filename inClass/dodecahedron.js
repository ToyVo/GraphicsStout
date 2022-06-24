/* global Matrix createProgram Vector */
/* eslint no-unused-vars: ["warn", { "varsIgnorePattern": "Dodecahedron" }] */

/**
 * vertex shader
 */
const decVertex = `
    attribute vec4 location;

    uniform mat4 view;
    uniform mat4 model;
    uniform mat4 projection;

    void main() {
       gl_Position = projection * view * model * location;
    }

`;

/**
 * fragment shader
 */
const decFragment = `
    precision mediump float;

    // add normal, light, color and model uniform
    uniform vec4 normal;
    uniform vec4 lightPos;
    uniform vec4 diffuseLight; //light * material
    uniform mat4 fModel;


    void main() {
        // compute the normalized vector
        vec3 n = normalize((fModel * normal).xyz);
        // get the dot of the norm and the light
        float diffDot = dot(-lightPos.xyz, n);

        // update color
        gl_FragColor = diffuseLight * max(diffDot, 0.0); // update this later
        gl_FragColor.a = 1.0;
    }
`;

/**
 * vertex shader
 */
const edgeVertex = `
    attribute vec4 location;

    uniform mat4 view;
    uniform mat4 model;
    uniform mat4 projection;

    void main() {
       gl_Position = projection * view * model * location;
    }

`;

/**
 * fragment shader
 */
const edgeFragment = `
    precision mediump float;

    uniform vec4 cColor;

    void main() {
       gl_FragColor = cColor;
    }
`;

/**
 * Creates a dodecahedron centered on the origin.
 */
class Dodecahedron {
    /**
     * Creates a dodecahedron.
     *
     * @param {WebGLRenderingContext} gl WebGL Context
     */
    constructor(gl) {
        // shaders
        this.wire = false;
        this.decProgram = createProgram(gl, decVertex, decFragment);
        this.edgeProgram = createProgram(gl, edgeVertex, edgeFragment);

        // vertices
        let gRatio = (1 + Math.sqrt(5)) / 2;
        let invGRatio = 1 / gRatio;

        this.vertices = new Float32Array([
            1, 1, 1, // 0
            1, 1, -1,
            1, -1, 1,
            1, -1, -1,
            -1, 1, 1, // 4
            -1, 1, -1,
            -1, -1, 1,
            -1, -1, -1,
            0, invGRatio, gRatio, // 8
            0, invGRatio, -gRatio,
            0, -invGRatio, gRatio,
            0, -invGRatio, -gRatio,
            invGRatio, gRatio, 0, // 12
            invGRatio, -gRatio, 0,
            -invGRatio, gRatio, 0,
            -invGRatio, -gRatio, 0,
            gRatio, 0, invGRatio, // 16
            gRatio, 0, -invGRatio,
            -gRatio, 0, invGRatio,
            -gRatio, 0, -invGRatio
        ]);

        // triangles
        this.triangles = new Uint8Array([
            7, 11, 3, 13, 15,
            7, 19, 5, 9, 11,
            7, 15, 6, 18, 19,
            4, 14, 5, 19, 18,
            1, 17, 3, 11, 9,
            12, 1, 9, 5, 14,
            2, 10, 6, 15, 13,
            16, 2, 13, 3, 17,
            18, 6, 10, 8, 4,
            0, 12, 14, 4, 8,
            0, 8, 10, 2, 16,
            0, 16, 17, 1, 12
        ]);

        // this.edges = new Uint8Array([
        //     // 0, 1, 12, 16, 17,
        //     0, 12, 12, 1, 1, 17, 17, 16, 16, 0,
        //     // 0, 16, 2, 8, 10,
        //     0, 16, 16, 2, 2, 10, 10, 8, 8, 0,
        //     // 0, 8, 12, 14, 4
        //     0, 8, 8, 4, 4, 14, 14, 12, 12, 0,
        //     // 18, 4, 8, 10, 6
        //     18, 4, 4, 8, 8, 10, 10, 6, 6, 18,
        //     // 16, 17, 2, 3, 13,
        //     16, 17, 17, 3, 3, 13, 13, 2, 2, 16,
        //     // 2, 10, 6, 13, 15
        //     2, 10, 10, 6, 6, 15, 15, 13, 13, 2,
        //     // 12, 1, 9, 5, 14,
        //     12, 1, 1, 9, 9, 5, 5, 14, 14, 12,
        //     // 1, 17, 3, 9, 11
        //     1, 17, 17, 3, 3, 11, 11, 9, 9, 1,
        //     // 4, 14, 18, 19, 5
        //     4, 14, 14, 5, 5, 19, 19, 18, 18, 4,
        //     // 7, 18, 19, 11,
        //     7, 19, 19, 18, 18, 6, 6, 15, 15, 7,
        //     // 7, 11, 5, 9, 19
        //     7, 11, 11, 9, 9, 5, 5, 19, 19, 7,
        //     // 7, 11, 3, 13, 15
        //     7, 11, 11, 3, 3, 13, 13, 15, 15, 7
        // ]);

        // move from model coordinates to world coordinates.
        this.world = new Matrix().scale(0.25, 0.25, 0.25);

        // create identity matrices for each transformation
        this.scaleMatrix = new Matrix(); // scale matrix
        this.rotateMatrix = new Matrix(); // rotate matrix
        this.translateMatrix = new Matrix(); // translate
        // create identity matrix for the model
        this.identity = new Matrix();

        this.lightPosition = new Float32Array([0, 1, 1, 0]);

        this.ambientColor = new Float32Array([0.5, 0.5, 0.5, 1]);
        this.diffuseColor = new Float32Array([0.5, 0.5, 0.5, 1]);
        this.specularColor = new Float32Array([0.5, 0.5, 0.5, 1]);

        this.ambientMaterial = new Float32Array([0.5, 0.5, 0.5, 1]);
        this.diffuseMaterial = new Float32Array([0.5, 0.5, 0.5, 1]);
        this.specularMaterial = new Float32Array([0.5, 0.5, 0.5, 1]);

        this.aRay = new Ray(gl);
        this.aRay.rotate(new Vector(this.lightPosition));
        this.aRay.setColor(this.ambientColor);

        this.dRay = new Ray(gl);
        this.dRay.rotate(new Vector(this.lightPosition));
        this.dRay.setColor(this.ambientColor);
        this.dRay.translate(0.02, 0.05, 0.02);

        this.sRay = new Ray(gl);
        this.sRay.rotate(new Vector(this.lightPosition));
        this.sRay.setColor(this.ambientColor);
        this.sRay.translate(-0.02, -0.05, -0.02);

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
        this.edgesBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.triangles, gl.STATIC_DRAW);

        this.buffered = true;
    }

    // render
    /**
     * Draws a dodecahedron using the provided context and the projection
     * matrix.
     *
     * @param {WebGLRenderingContext} gl WebGL context
     * @param {Matrix} projection Projection matrix
     */
    render(gl, projection, view) {
        if (!this.buffered) {
            this.bufferData(gl);
        }

        // pentagons
        // TODO get attrib and uniforms
        let verLoc = gl.getAttribLocation(this.decProgram, 'location');
        let matProjection = gl.getUniformLocation(this.decProgram, 'projection');
        let matModel = gl.getUniformLocation(this.decProgram, 'model');
        let matView = gl.getUniformLocation(this.decProgram, 'view');

        // fragment shader uniforms
        let n = gl.getUniformLocation(this.decProgram, 'normal');
        let light = gl.getUniformLocation(this.decProgram, 'lightPos');
        let diffuse = gl.getUniformLocation(this.decProgram, 'diffuseLight');
        let fragModel = gl.getUniformLocation(this.decProgram, 'fModel');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.vertexAttribPointer(verLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(verLoc);

        gl.useProgram(this.decProgram);

        gl.uniformMatrix4fv(matProjection, false, projection.getData());
        gl.uniformMatrix4fv(matModel, false, this.getModel().getData());
        gl.uniformMatrix4fv(matView, false, view.getData());

        // fragment shader
        gl.uniform4fv(light, this.lightPosition);
        gl.uniform4fv(diffuse, this.multArray(this.diffuseColor, this.diffuseMaterial));
        gl.uniformMatrix4fv(fragModel, false, this.getModel().getData());
        // show normals
        this.edges = new Float32Array(72);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
        for (let i = 0; i < 12; i++) {
            let norm = this.getNormal(i);
            gl.uniform4fv(n, norm.getData());

            this.edges[i * 6] = 0;
            this.edges[i * 6 + 1] = 0;
            this.edges[i * 6 + 2] = 0;
            this.edges[i * 6 + 3] = norm.getX() * 2;
            this.edges[i * 6 + 4] = norm.getY() * 2;
            this.edges[i * 6 + 5] = norm.getZ() * 2;

            // TODO update normal

            gl.drawElements(gl.TRIANGLE_FAN, 5, gl.UNSIGNED_BYTE, i * 5);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.edgesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.edges, gl.STATIC_DRAW);
        // wire frame
        verLoc = gl.getAttribLocation(this.edgeProgram, 'location');
        matProjection = gl.getUniformLocation(this.edgeProgram, 'projection');
        matModel = gl.getUniformLocation(this.edgeProgram, 'model');
        matView = gl.getUniformLocation(this.edgeProgram, 'view');
        let eColor = gl.getUniformLocation(this.edgeProgram, 'cColor');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.edgesBuffer);
        gl.vertexAttribPointer(verLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(verLoc);

        gl.useProgram(this.edgeProgram);

        gl.uniformMatrix4fv(matProjection, false, projection.getData());
        gl.uniformMatrix4fv(matModel, false, this.getModel().getData());
        gl.uniformMatrix4fv(matView, false, view.getData());
        gl.uniform4fv(eColor, [0, 1, 0, 1]);

        gl.drawArrays(gl.LINES, 0, this.edges.length / 3);

        this.aRay.render(gl, projection, view);
        this.dRay.render(gl, projection, view);
        this.sRay.render(gl, projection, view);
    }

    subVec(v1, v2) {
        return new Vector([v1.getX() - v2.getX(), v1.getY() - v2.getY(), v1.getZ() - v2.getZ()]);
    }

    addVec(v1, v2) {
        return new Vector([v1.getX() + v2.getX(), v1.getY() + v2.getY(), v1.getZ() + v2.getZ()]);
    }

    multArray(v1, v2) {
        return new Float32Array([v1[0] * v2[0], v1[1] * v2[1], v1[2] * v2[2], v1[3] * v2[3]]);
    }

    getNormal(face) {
        let p1 = this.getPoint(this.triangles[face * 5]);
        let p2 = this.getPoint(this.triangles[face * 5 + 1]);
        let p3 = this.getPoint(this.triangles[face * 5 + 2]);

        let n1 = this.subVec(p3, p1).crossProduct(this.subVec(p2, p1));
        // console.log(p1.getData(), p2.getData(), p3.getData())
        n1.normalize();

        return n1;
    }

    getPoint(index) {
        let x = this.vertices[index * 3];
        let y = this.vertices[index * 3 + 1];
        let z = this.vertices[index * 3 + 2];

        return new Vector([x, y, z]);
    }

    /**
     * Sets the this.scaleMatrix variable to a new scaling matrix that uses the
     * parameters for the scaling informaton.
     *
     * @param {number} sx Amount to scale the shape in the x direction
     * @param {number} sy Amount to scale the shape in the y direction
     * @param {number} sz Amount to scale the shape in the z direction
     */
    scale(sx, sy, sz) {
        // TODO
        this.scaleMatrix = new Matrix();
        this.scaleMatrix = this.scaleMatrix.scale(sx, sy, sz);
    }

    /**
     * Sets the this.rotateMatrix variable to a new rotation matrix that uses the
     * parameters for the rotation informaton.
     *
     * @param {number} xtheta Amount in degrees to rotate the shape around the x-axis
     * @param {number} ytheta Amount in degrees to rotate the shape around the y-axis
     * @param {number} ztheta Amount in degrees to rotate the shape around the z-axis
     */
    rotate(xtheta, ytheta, ztheta) {
        // TODO
        this.rotateMatrix = new Matrix();
        this.rotateMatrix = this.rotateMatrix.rotate(xtheta, ytheta, ztheta);
    }

    /**
     * Sets the this.translateMatrix variable to a new translation matrix that uses the
     * parameters for the translation informaton.
     *
     * @param {number} tx Amount to translate the shape in the x direction.
     * @param {number} ty Amount to translate the shape in the y direction.
     * @param {number} tz Amount to translate the shape in the z direction.
     */
    translate(tx, ty, tz) {
        // TODO
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
     * @return {Matrix} A matrix with all of the transformations applied to the shape.
     */
    getModel() {
        // TODO
        this.model = this.translateMatrix.mult(this.rotateMatrix).mult(this.scaleMatrix).mult(this.world);
        return this.model;
    }

    setColors(ambient, diffuse, specular) {
        this.ambientColor = new Float32Array(ambient);
        this.diffuseColor = new Float32Array(diffuse);
        this.specularColor = new Float32Array(specular);
        this.aRay.setColor(this.ambientColor);
        this.dRay.setColor(this.diffuseColor);
        this.sRay.setColor(this.specularColor);
    }

    setMaterials(ambient, diffuse, specular) {
        this.ambientMaterial = new Float32Array(ambient);
        this.diffuseMaterial = new Float32Array(diffuse);
        this.specularMaterial = new Float32Array(specular);
    }

    setLightPosition(radius, polarAngle, azimuth) {
        // reverse the vector
        this.lightPosition = new Float32Array([
            radius * Math.sin(polarAngle) * Math.cos(azimuth),
            radius * Math.cos(polarAngle),
            radius * Math.sin(polarAngle) * Math.sin(azimuth),
            0
        ]);

        this.aRay.rotate(new Vector(this.lightPosition));
        this.dRay.rotate(new Vector(this.lightPosition));
        this.sRay.rotate(new Vector(this.lightPosition));
    }
}

/**
 * Creates a ray starting at the origin along the x-axis
 */
class Ray {
    /**
     * Creates a ray.
     *
     * @param {WebGLRenderingContext} gl WebGL Context
     */
    constructor(gl) {
        // shaders
        this.wire = false;
        this.program = createProgram(gl, edgeVertex, edgeFragment);
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

        this.world = new Matrix().scale(2, 0.01, 0.01);

        this.rotateMatrix = new Matrix(); // rotate matrix
        this.translateMatrix = new Matrix();

        this.colors = [0, 0, 0, 1];
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
        this.edgesBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.triangles, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.edges, gl.STATIC_DRAW);

        this.buffered = true;
    }

    // render
    /**
     * Draws a ray using the provided context and the projection
     * matrix.
     *
     * @param {WebGLRenderingContext} gl WebGL context
     * @param {Matrix} projection Projection matrix
     */
    render(gl, projection, view) {
        if (!this.buffered) {
            this.bufferData(gl);
        }

        let verLoc = gl.getAttribLocation(this.program, 'location');
        let matProjection = gl.getUniformLocation(this.program, 'projection');
        let matModel = gl.getUniformLocation(this.program, 'model');
        let matView = gl.getUniformLocation(this.program, 'view');
        let eColor = gl.getUniformLocation(this.program, 'cColor');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.vertexAttribPointer(verLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(verLoc);

        gl.useProgram(this.program);

        gl.uniformMatrix4fv(matProjection, false, projection.getData());
        gl.uniformMatrix4fv(matModel, false, this.getModel().getData());
        gl.uniformMatrix4fv(matView, false, view.getData());

        gl.uniform4fv(eColor, this.colors);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
        gl.drawElements(gl.TRIANGLE_STRIP, this.triangles.length, gl.UNSIGNED_BYTE, 0);
    }

    /**
     * Sets the this.translateMatrix variable to a new translation matrix that uses the
     * parameters for the translation informaton.
     *
     * @param {number} tx Amount to translate the ray in the x direction.
     * @param {number} ty Amount to translate the ray in the y direction.
     * @param {number} tz Amount to translate the ray in the z direction.
     */
    translate(tx, ty, tz) {
        this.translateMatrix = new Matrix();
        this.translateMatrix = this.translateMatrix.translate(tx, ty, tz);
    }

    /**
     * Sets the this.rotateMatrix variable to a new rotation matrix that uses the
     * parameters for the rotation informaton.
     *
     * @param {Vector} vector Vector to rotate this ray to
     */
    rotate(vector) {
        this.rotateMatrix = this.getRotateToVector(new Vector([1, 0, 0]), vector);
    }

    /**
     * Gets a rotation matrix that moves a start vector to the end vector.
     *
     * @param {Vector} start Original vector
     * @param {Vector} end  Destination vector
     *
     * @return {Matrix} A rotation matrix that moves start to end.
     */
    getRotateToVector (start, end) {
        let nStart = new Vector(start.getData());
        let nEnd = new Vector(end.getData());
        nStart.normalize();
        nEnd.normalize();
        let a = nStart.crossProduct(nEnd);
        a.normalize();

        let c = nStart.dotProduct(nEnd);
        let alpha = Math.acos(c);
        let s = Math.sin(alpha);

        let minC = 1 - c;

        return new Matrix([
            a.getX() * a.getX() * minC + c, a.getX() * a.getY() * minC - s * a.getZ(),
            a.getX() * a.getZ() * minC + s * a.getY(), 0,
            a.getX() * a.getY() * minC + s * a.getZ(), a.getY() * a.getY() * minC + c,
            a.getY() * a.getZ() * minC - s * a.getX(), 0,
            a.getX() * a.getZ() * minC - s * a.getY(), a.getY() * a.getZ() * minC + s * a.getX(),
            a.getZ() * a.getZ() * minC + c, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * Changes the color of the ray.
     *
     * @param {Numeric[]} cols The color of the ray.
     */
    setColor(cols) {
        this.colors = cols;
    }

    /**
     * Creates a model matrix by combining the other matrices.
     *
     * @return {Matrix} A matrix with all of the transformations applied to the ray.
     */
    getModel() {
        return this.translateMatrix.mult(this.rotateMatrix.mult(this.world));
    }
}
