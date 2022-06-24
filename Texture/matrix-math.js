/* eslint no-unused-vars: ["warn", {"varsIgnorePattern": "(Matrix)|(Vector)"}] */

/**
 * Represents a 4x4 matrix suitable for performing transformations
 * on a vector of homogeneous coordinates.
 */
class Matrix {
    /**
     * Creates a 4x4 matrix. If no parameter is given, the identity
     * matrix is created. If values is provided it should be an array
     * and it will provide UP TO 16 values for the matrix. If there are
     * less than 16 values, the remaining values in the array should
     * correspond to the identify matrix. If there are more than 16,
     * the rest should be ignored.
     *
     * The data is assumed to be in COLUMN MAJOR order.
     *
     * To see if values was passed to the function, you can check if
     *      typeof values !== "undefined"
     * This will be true if values has a value.
     *
     * @param {number[]} values (optional) An array of floating point values.
     *
     */
    constructor(values) {
        this.identity();

        if (typeof values !== 'undefined') {
            for (let i = 0; i < 16 && i < values.length; i++) {
                this.matrix[Math.trunc(i / 4) + (i % 4) * 4] = values[i];
                // console.log("index: " + Math.trunc(i / 4) + (i % 4) * 4);
            }
        }
    }

    /**
     * Returns a Float32Array array with the data from the matrix. The
     * data should be in COLUMN MAJOR form.
     *
     * @return {Float32Array} Array with the matrix data.
     */
    getData() {
        return this.matrix;
    }

    /**
     * Gets a value from the matrix at position (r, c).
     *
     * @param {number} r Row number (0-3) of value in the matrix.
     * @param {number} c Column number (0-3) of value in the matrix.
     */
    getValue(r, c) {
        return this.matrix[r + c * 4];
    }

    /**
     * Updates a single position (r, c) in the matrix with value.
     *
     * @param {number} r Row number (0-3) of value in the matrix.
     * @param {number} c Column number (0-3) of value in the matrix.
     * @param {number} value Value to place in the matrix.
     */
    setValue(r, c, value) {
        this.matrix[r + c * 4] = value;
    }

    /**
     * Resets the matrix to be the identity matrix.
     */
    identity() {
        this.matrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * Multiplies the current matrix by the parameter matrix and returns the result.
     * This operation should not change the current matrix or the parameter.
     *
     * @param {Matrix} matB Matrix to post-multiply the current matrix by.
     *
     * @return {Matrix} Product of the current matrix and the parameter.
     */
    mult(matB) {
        let result = new Matrix();

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                result.setValue(r, c, this.getValue(r, 0) * matB.getValue(0, c) +
                    this.getValue(r, 1) * matB.getValue(1, c) +
                    this.getValue(r, 2) * matB.getValue(2, c) +
                    this.getValue(r, 3) * matB.getValue(3, c));
            }
        }

        return result;
    }

    // multV(vecB) {
    //     let v = [0, 0, 0];
    //     for (let r = 0; r < 3; r++) {
    //         v[r] = this.getValue(r, 0) * vecB.getX() +
    //             this.getValue(r, 1) * vecB.getY() +
    //             this.getValue(r, 2) * vecB.getZ();
    //     }

    //     return new Vector(v);
    // }

    /**
     * Creates a new Matrix that is the current matrix translated by
     * the parameters.
     *
     * This should not change the current matrix.
     *
     * @param {number} x Amount to translate in the x direction.
     * @param {number} y Amount to translate in the y direction.
     * @param {number} z Amount to translate in the z direction.
     *
     * @return {Matrix} Result of translating the current matrix.
     */
    translate(x, y, z) {
        let t = new Matrix();
        t.matrix[12] = x;
        t.matrix[13] = y;
        t.matrix[14] = z;

        return this.mult(t);
    }

    /**
     * Rotatation around the x-axis. If provided, the rotation is done around
     * the point (x, y, z). By default, that point is the origin.
     *
     * This should not change the current matrix.
     *
     * @param {number} theta Amount in DEGREES to rotate around the x-axis.
     * @param {number} x x coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} y y coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} z z coordinate of the point around which to rotate. Defaults to 0.
     *
     * @return {Matrix} Result of rotating the current matrix.
     */
    rotateX(theta, x = 0, y = 0, z = 0) {
        return this.rotate(theta, 0, 0, x, y, z);
    }

    /**
     * Rotatation around the y-axis. If provided, the rotation is done around
     * the point (x, y, z). By default, that point is the origin.
     *
     * This should not change the current matrix.
     *
     * @param {number} theta Amount in DEGREES to rotate around the y-axis.
     * @param {number} x x coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} y y coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} z z coordinate of the point around which to rotate. Defaults to 0.
     *
     * @return {Matrix} Result of rotating the current matrix.
     */
    rotateY(theta, x = 0, y = 0, z = 0) {
        return this.rotate(0, theta, 0, x, y, z);
    }

    /**
     * Rotatation around the z-axis. If provided, the rotation is done around
     * the point (x, y, z). By default, that point is the origin.
     *
     * This should not change the current matrix.
     *
     * @param {number} theta Amount in DEGREES to rotate around the z-axis.
     * @param {number} x x coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} y y coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} z z coordinate of the point around which to rotate. Defaults to 0.
     *
     * @return {Matrix} Result of rotating the current matrix.
     */
    rotateZ(theta, x = 0, y = 0, z = 0) {
        return this.rotate(0, 0, theta, x, y, z);
    }

    /**
     * Rotatation around the z-axis followed by a rotation around the y-axis and then
     * the z-axis. If provided, the rotation is done around the point (x, y, z).
     * By default, that point is the origin.
     *
     * The rotation must be done in order z-axis, y-axis, x-axis.
     *
     * This should not change the current matrix.
     *
     * @param {number} thetax Amount in DEGREES to rotate around the x-axis.
     * @param {number} thetay Amount in DEGREES to rotate around the y-axis.
     * @param {number} thetaz Amount in DEGREES to rotate around the z-axis.
     * @param {number} x x coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} y y coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} z z coordinate of the point around which to rotate. Defaults to 0.
     *
     * @return {Matrix} Result of rotating the current matrix.
     */
    rotate(thetax, thetay, thetaz, x = 0, y = 0, z = 0) {
        let rx = new Matrix();
        let cosx = Math.cos(thetax / 180 * Math.PI);
        let sinx = Math.sin(thetax / 180 * Math.PI);
        rx.matrix[5] = cosx;
        rx.matrix[9] = -sinx;
        rx.matrix[6] = sinx;
        rx.matrix[10] = cosx;

        let ry = new Matrix();
        let cosy = Math.cos(thetay / 180 * Math.PI);
        let siny = Math.sin(thetay / 180 * Math.PI);
        ry.matrix[10] = cosy;
        ry.matrix[2] = -siny;
        ry.matrix[8] = siny;
        ry.matrix[0] = cosy;

        let rz = new Matrix();
        let cosz = Math.cos(thetaz / 180 * Math.PI);
        let sinz = Math.sin(thetaz / 180 * Math.PI);
        rz.matrix[0] = cosz;
        rz.matrix[4] = -sinz;
        rz.matrix[1] = sinz;
        rz.matrix[5] = cosz;

        return this.translate(x, y, z).mult(rx).mult(ry).mult(rz).translate(-x, -y, -z);
    }

    /**
     * Scaling relative to a point. If provided, the scaling is done relative to
     * the point (x, y, z). By default, that point is the origin.
     *
     * This should not change the current matrix.
     *
     * @param {number} sx Amount to scale in the x direction.
     * @param {number} sy Amount to scale in the y direction.
     * @param {number} sz Amount to scale in the z direction.
     * @param {number} x x coordinate of the point around which to scale. Defaults to 0.
     * @param {number} y y coordinate of the point around which to scale. Defaults to 0.
     * @param {number} z z coordinate of the point around which to scale. Defaults to 0.
     *
     * @return {Matrix} Result of scaling the current matrix.
     */
    scale(sx, sy, sz, x = 0, y = 0, z = 0) {
        let s = new Matrix();
        s.matrix[0] = sx;
        s.matrix[5] = sy;
        s.matrix[10] = sz;

        return this.translate(x, y, z).mult(s).translate(-x, -y, -z);
    }

    /**
     * Prints the matrix as an HTML table.
     *
     * @return {string} HTML table with the contents of the matrix.
     */
    asHTML() {
        let output = '<table>';

        for (let r = 0; r < 4; r++) {
            output += '<tr>';

            for (let c = 0; c < 4; c++) {
                output += '<td>' + this.getValue(r, c).toFixed(2) + '</td>';
            }

            output += '</tr>';
        }

        output += '</table>';

        return output; // TODO
    }
}

// column order
// require tests

/**
 * Represents a vector in 3d space.
 */
class Vector {
    /**
     * Creates a vector. If no parameter is given, the vector is set to
     * all 0's. If values is provided it should be an array
     * and it will provide UP TO 3 values for the vector. If there are
     * less than 3 values, the remaining values in the array should
     * set to 0. If there are more than 3, the rest should be ignored.
     *
     * To see if values was passed to the function, you can check if
     *      typeof values !== "undefined"
     * This will be true if values has a value.
     *
     * @param {number[]} values (optional) An array of floating point values.
     *
     */
    constructor(values) {
        this.data = new Float32Array([0, 0, 0, 0]);

        if (typeof values !== 'undefined') {
            for (let i = 0; i < values.length && i < 3; i++) {
                this.data[i] = values[i];
            }
        }
    }

    /**
     * Calculates the cross product of the current vector and the parameter.
     *
     * This should not change the current vector or the parameter.
     *
     * @param {Vector} v Vector to cross with the current vector.
     *
     * @return {Vector} The cross product of the current vector and the parameter.
     */
    crossProduct(v) {
        return new Vector([
            this.data[1] * v.data[2] - this.data[2] * v.data[1],
            this.data[2] * v.data[0] - this.data[0] * v.data[2],
            this.data[0] * v.data[1] - this.data[1] * v.data[0]
        ]);
    }

    /**
     * Calculates the dot product of the current vector and the parameter.
     *
     * This should not change the current vector or the parameter.
     *
     * @param {Vector} v Vector to dot with the current vector.
     *
     * @return {number} The dot product of the current vector and the parameter.
     */
    dotProduct(v) {
        return this.data[0] * v.data[0] +
            this.data[1] * v.data[1] +
            this.data[2] * v.data[2];
    }

    /**
     * Normalized the current vector so that is has a
     * length of 1.
     */
    normalize() {
        let len = this.length();

        if (len !== 0) {
            for (let i = 0; i < 3; i++) {
                this.data[i] /= len;
            }
        }
    }

    /**
     * Gets the length (magnitude) of the current vector.
     *
     * @return {number} The length of the current vector.
     */
    length() {
        return Math.sqrt(this.data[0] * this.data[0] +
            this.data[1] * this.data[1] +
            this.data[2] * this.data[2]);
    }

    /**
     * Scales the current vector by amount s.
     *
     * @param {number} s Amount to scale the vector.
     */
    scale(s) {
        for (let i = 0; i < 3; i++) {
            this.data[i] *= s;
        }
    }

    /**
     * Returns the x value of the vector.
     *
     * @return {number} The x value of the vector.
     */
    getX() {
        return this.data[0];
    }

    /**
     * Returns the y value of the vector.
     *
     * @return {number} The y value of the vector.
     */
    getY() {
        return this.data[1];
    }

    /**
     * Returns the z value of the vector.
     *
     * @return {number} The z value of the vector.
     */
    getZ() {
        return this.data[2];
    }

    /**
     * Returns a Float32Array with the contents of the vector. The
     * data in the vector should be in the order [x, y, z, w]. This
     * makes it suitable for multiplying by a 4x4 matrix.
     *
     * The w value should always be 0.
     *
     * @return {Float32Array} The vector as a 4 element array.
     */
    getData() {
        return this.data;
    }
}
