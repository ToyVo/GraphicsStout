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

    varying vec3 normal;

    void main() {
       gl_Position = projection * view * model * location;
       normal = location.xyz;
    }

`;

/**
 * fragment shader
 */
const decFragment = `
    precision mediump float;

    uniform samplerCube texture;
    varying vec3 normal;

    void main() {
        // update color
        gl_FragColor = textureCube(texture, normalize(normal)); // vec4(0, 0, 1, 1);
    }
`;

/**
 * vertex shader
 */
const bumpVertex = `
    attribute vec4 location;

    uniform mat4 view;
    uniform mat4 model;
    uniform mat4 projection;

    uniform vec4 normal; // normal for shape
    uniform vec4 lightPos; // location of a distance light source
    uniform vec4 objTangent; // tangent vector

    varying vec3 texLight; // light source in texture coords
    varying vec3 texNormal; // normal in texture coords
    varying vec3 objNormal;
    // would need viewer in texture coords too if doing specular light

    //taken from: https://pathtogeek.com/exploring-bump-mapping-with-webgl
    mat3 transpose(in mat3 inMatrix)
    {
        vec3 i0 = inMatrix[0];
        vec3 i1 = inMatrix[1];
        vec3 i2 = inMatrix[2];

        mat3 outMatrix = mat3(
            vec3(i0.x, i1.x, i2.x),
            vec3(i0.y, i1.y, i2.y),
            vec3(i0.z, i1.z, i2.z)
        );

        return outMatrix;
    }

    void main() {
        gl_Position = projection * view * model * location;

        // TODO finish this
        vec3 n = normalize(model * normal).xyz;
        vec3 t = normalize(model * objTangent).xyz;
        vec3 b = cross(n, t);

        mat3 inv = transpose(mat3(t, b, n));
        vec3 modelLight = inv * lightPos.xyz;

        texLight = -modelLight;

        texLight = normalize(texLight);
        texNormal = normal.xyz;
        objNormal =  location.xyz;
    }

`;

/**
 * fragment shader
 */
const bumpFragment = `
    precision mediump float;

    uniform vec4 diffuseLight; //light * material
    uniform samplerCube texture;

    //uniform mat4 fModel;
    varying vec3 texLight;
    varying vec3 texNormal;
    varying vec3 objNormal;

    void main() {
        vec3 t = (textureCube(texture, normalize(objNormal)).xyz);

        vec4 ambient = vec4(0.4 * t.r, 0.2 * t.g, 0.2 * t.b, 1.0);
        // update color
        gl_FragColor = ambient + diffuseLight * max(dot(texLight, t), 0.0); // update this later
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
        this.bumpProgram = createProgram(gl, bumpVertex, bumpFragment);
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

        this.edges = new Uint8Array([
            // 0, 1, 12, 16, 17,
            0, 12, 12, 1, 1, 17, 17, 16, 16, 0,
            // 0, 16, 2, 8, 10,
            0, 16, 16, 2, 2, 10, 10, 8, 8, 0,
            // 0, 8, 12, 14, 4
            0, 8, 8, 4, 4, 14, 14, 12, 12, 0,
            // 18, 4, 8, 10, 6
            18, 4, 4, 8, 8, 10, 10, 6, 6, 18,
            // 16, 17, 2, 3, 13,
            16, 17, 17, 3, 3, 13, 13, 2, 2, 16,
            // 2, 10, 6, 13, 15
            2, 10, 10, 6, 6, 15, 15, 13, 13, 2,
            // 12, 1, 9, 5, 14,
            12, 1, 1, 9, 9, 5, 5, 14, 14, 12,
            // 1, 17, 3, 9, 11
            1, 17, 17, 3, 3, 11, 11, 9, 9, 1,
            // 4, 14, 18, 19, 5
            4, 14, 14, 5, 5, 19, 19, 18, 18, 4,
            // 7, 18, 19, 11,
            7, 19, 19, 18, 18, 6, 6, 15, 15, 7,
            // 7, 11, 5, 9, 19
            7, 11, 11, 9, 9, 5, 5, 19, 19, 7,
            // 7, 11, 3, 13, 15
            7, 11, 11, 3, 3, 13, 13, 15, 15, 7
        ]);

        // move from model coordinates to world coordinates.
        this.world = new Matrix().scale(0.25, 0.25, 0.25);

        // create identity matrices for each transformation
        this.scaleMatrix = new Matrix(); // scale matrix
        this.rotateMatrix = new Matrix(); // rotate matrix
        this.translateMatrix = new Matrix(); // translate
        // create identity matrix for the model
        this.identity = new Matrix();

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

        this.textureData = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.textureData);

        // let texture = "texture1.jpg";
        let texture = 'bump2.jpg';
        // let texture = "";
        this.faces = [
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, src: texture },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, src: texture },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, src: texture },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, src: texture },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, src: texture },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, src: texture }
        ];

        const textureRef = this.textureData;

        for (let i = 0; i < this.faces.length; i++) {
            const face = this.faces[i].target;
            gl.texImage2D(this.faces[i].target, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
                gl.UNSIGNED_BYTE, new Uint8Array([1, 0, 0, 1]));

            const image = new Image();

            image.onload = function() {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureRef);
                gl.texImage2D(face, 0, gl.RGBA,
                    gl.RGBA, gl.UNSIGNED_BYTE, this);
                // gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            };
            image.src = this.faces[i].src;
        }

        this.buffered = true;
    }

    renderTexture(gl, projection, view) {
        let verLoc = gl.getAttribLocation(this.decProgram, 'location');
        let matProjection = gl.getUniformLocation(this.decProgram, 'projection');
        let matModel = gl.getUniformLocation(this.decProgram, 'model');
        let matView = gl.getUniformLocation(this.decProgram, 'view');
        let tCube = gl.getUniformLocation(this.decProgram, 'texture');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.vertexAttribPointer(verLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(verLoc);

        gl.useProgram(this.decProgram);

        gl.uniformMatrix4fv(matProjection, false, projection.getData());
        gl.uniformMatrix4fv(matModel, false, this.getModel().getData());
        gl.uniformMatrix4fv(matView, false, view.getData());

        gl.uniform1i(tCube, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.textureData);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
        for (let i = 0; i < 12; i++) {
            gl.drawElements(gl.TRIANGLE_FAN, 5, gl.UNSIGNED_BYTE, i * 5);
        }
    }

    renderBump(gl, projection, view) {
        // pentagons
        let verLoc = gl.getAttribLocation(this.bumpProgram, 'location');
        let matProjection = gl.getUniformLocation(this.bumpProgram, 'projection');
        let matModel = gl.getUniformLocation(this.bumpProgram, 'model');
        let matView = gl.getUniformLocation(this.bumpProgram, 'view');
        let tCube = gl.getUniformLocation(this.bumpProgram, 'texture');
        let n = gl.getUniformLocation(this.bumpProgram, 'normal');
        let light = gl.getUniformLocation(this.bumpProgram, 'lightPos');
        let tan = gl.getUniformLocation(this.bumpProgram, 'objTangent');
        let diffuse = gl.getUniformLocation(this.bumpProgram, 'diffuseLight');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.vertexAttribPointer(verLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(verLoc);

        gl.useProgram(this.bumpProgram);

        gl.uniformMatrix4fv(matProjection, false, projection.getData());
        gl.uniformMatrix4fv(matModel, false, this.getModel().getData());
        gl.uniformMatrix4fv(matView, false, view.getData());

        gl.uniform1i(tCube, 0);

        gl.uniform4fv(diffuse, [0.6, 0.2, 0.2, 1.0]);
        gl.uniform4fv(light, [-1, 1, 1, 1.0]);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.textureData);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);

        for (let i = 0; i < 12; i++) {
            let norm = this.getNormal(i);
            gl.uniform4fv(n, norm.getData());
            let oTan = this.getTangent(i);
            gl.uniform4fv(tan, oTan.getData());

            gl.drawElements(gl.TRIANGLE_FAN, 5, gl.UNSIGNED_BYTE, i * 5);
        }
    }

    renderEdges(gl, projection, view) {
        gl.useProgram(this.edgeProgram);

        // wire frame
        let verLoc = gl.getAttribLocation(this.edgeProgram, 'location');
        let matProjection = gl.getUniformLocation(this.edgeProgram, 'projection');
        let matModel = gl.getUniformLocation(this.edgeProgram, 'model');
        let matView = gl.getUniformLocation(this.edgeProgram, 'view');
        let eColor = gl.getUniformLocation(this.edgeProgram, 'cColor');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.vertexAttribPointer(verLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(verLoc);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgesBuffer);

        gl.uniformMatrix4fv(matProjection, false, projection.getData());
        gl.uniformMatrix4fv(matModel, false, this.getModel().getData());
        gl.uniformMatrix4fv(matView, false, view.getData());
        gl.uniform4fv(eColor, [0, 1, 0, 1]);

        gl.drawElements(gl.LINES, this.edges.length, gl.UNSIGNED_BYTE, 0);
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

        // TODO
        // this.renderTexture(gl, projection, view);
        this.renderBump(gl, projection, view);

        this.renderEdges(gl, projection, view);
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

        return n1;
    }

    getTangent(face) {
        let p1 = this.getPoint(this.triangles[face * 5]);
        let p2 = this.getPoint(this.triangles[face * 5 + 1]);

        let tan = this.subVec(p2, p1);

        return tan;
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
}
