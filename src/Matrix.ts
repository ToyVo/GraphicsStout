import Vector from './Vector';

/**
 * Represents a 4x4 matrix suitable for performing transformations
 * on a vector of homogeneous coordinates.
 */
export default class Matrix {
	private matrix: Float32Array;

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
	 * @param values An array of floating point values.
	 *
	 */
	constructor(values?: Array<number>) {
		this.matrix = this.identity();

		if(values) {
			for(let i = 0; i < 16 && i < values.length; i++) {
				this.matrix[Math.trunc(i / 4) + (i % 4) * 4] = values[i];
				// console.log("index: " + Math.trunc(i / 4) + (i % 4) * 4);
			}
		}
	}

	/**
	 * Returns a Float32Array array with the data from the matrix. The
	 * data should be in COLUMN MAJOR form.
	 *
	 * @return Array with the matrix data.
	 */
	getData(): Float32Array {
		return this.matrix;
	}

	/**
	 * Gets a value from the matrix at position (r, c).
	 *
	 * @param r Row number (0-3) of value in the matrix.
	 * @param c Column number (0-3) of value in the matrix.
	 */
	getValue(r: number, c: number): number {
		return this.matrix[r + c * 4];
	}

	/**
	 * Updates a single position (r, c) in the matrix with value.
	 *
	 * @param r Row number (0-3) of value in the matrix.
	 * @param c Column number (0-3) of value in the matrix.
	 * @param value Value to place in the matrix.
	 */
	setValue(r: number, c: number, value: number): void {
		this.matrix[r + c * 4] = value;
	}

	/**
	 * Resets the matrix to be the identity matrix.
	 */
	identity(): Float32Array {
		return new Float32Array([
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
	 * @param matB Matrix to post-multiply the current matrix by.
	 *
	 * @return Product of the current matrix and the parameter.
	 */
	mult(matB: Matrix): Matrix {
		const result = new Matrix();

		for(let r = 0; r < 4; r++) {
			for(let c = 0; c < 4; c++) {
				result.setValue(r, c, this.getValue(r, 0) * matB.getValue(0, c) +
					this.getValue(r, 1) * matB.getValue(1, c) +
					this.getValue(r, 2) * matB.getValue(2, c) +
					this.getValue(r, 3) * matB.getValue(3, c));
			}
		}

		return result;
	}

	multV(vecB: Vector): Vector {
		const v = [0, 0, 0];
		for(let r = 0; r < 3; r++) {
			v[r] = this.getValue(r, 0) * vecB.getX() +
				this.getValue(r, 1) * vecB.getY() +
				this.getValue(r, 2) * vecB.getZ();
		}
		return new Vector(new Float32Array(v));
	}

	/**
	 * Creates a new Matrix that is the current matrix translated by
	 * the parameters.
	 *
	 * This should not change the current matrix.
	 *
	 * @param x Amount to translate in the x direction.
	 * @param y Amount to translate in the y direction.
	 * @param z Amount to translate in the z direction.
	 *
	 * @return Result of translating the current matrix.
	 */
	translate(x: number, y: number, z: number): Matrix {
		const t = new Matrix();
		t.matrix[12] = x;
		t.matrix[13] = y;
		t.matrix[14] = z;

		return this.mult(t);
	}

	/**
	 * Rotation around the x-axis. If provided, the rotation is done around
	 * the point (x, y, z). By default, that point is the origin.
	 *
	 * This should not change the current matrix.
	 *
	 * @param theta Amount in DEGREES to rotate around the x-axis.
	 * @param x x coordinate of the point around which to rotate. Defaults to 0.
	 * @param y y coordinate of the point around which to rotate. Defaults to 0.
	 * @param z z coordinate of the point around which to rotate. Defaults to 0.
	 *
	 * @return Result of rotating the current matrix.
	 */
	rotateX(theta: number, x: number = 0, y: number = 0, z: number = 0): Matrix {
		return this.rotate(theta, 0, 0, x, y, z);
	}

	/**
	 * Rotation around the y-axis. If provided, the rotation is done around
	 * the point (x, y, z). By default, that point is the origin.
	 *
	 * This should not change the current matrix.
	 *
	 * @param theta Amount in DEGREES to rotate around the y-axis.
	 * @param x x coordinate of the point around which to rotate. Defaults to 0.
	 * @param y y coordinate of the point around which to rotate. Defaults to 0.
	 * @param z z coordinate of the point around which to rotate. Defaults to 0.
	 *
	 * @return Result of rotating the current matrix.
	 */
	rotateY(theta: number, x: number = 0, y: number = 0, z: number = 0): Matrix {
		return this.rotate(0, theta, 0, x, y, z);
	}

	/**
	 * Rotation around the z-axis. If provided, the rotation is done around
	 * the point (x, y, z). By default, that point is the origin.
	 *
	 * This should not change the current matrix.
	 *
	 * @param theta Amount in DEGREES to rotate around the z-axis.
	 * @param x x coordinate of the point around which to rotate. Defaults to 0.
	 * @param y y coordinate of the point around which to rotate. Defaults to 0.
	 * @param z z coordinate of the point around which to rotate. Defaults to 0.
	 *
	 * @return Result of rotating the current matrix.
	 */
	rotateZ(theta: number, x: number = 0, y: number = 0, z: number = 0): Matrix {
		return this.rotate(0, 0, theta, x, y, z);
	}

	/**
	 * Rotation around the z-axis followed by a rotation around the y-axis and then
	 * the z-axis. If provided, the rotation is done around the point (x, y, z).
	 * By default, that point is the origin.
	 *
	 * The rotation must be done in order z-axis, y-axis, x-axis.
	 *
	 * This should not change the current matrix.
	 *
	 * @param thetaX Amount in DEGREES to rotate around the x-axis.
	 * @param thetaY Amount in DEGREES to rotate around the y-axis.
	 * @param thetaZ Amount in DEGREES to rotate around the z-axis.
	 * @param x x coordinate of the point around which to rotate. Defaults to 0.
	 * @param y y coordinate of the point around which to rotate. Defaults to 0.
	 * @param z z coordinate of the point around which to rotate. Defaults to 0.
	 *
	 * @return Result of rotating the current matrix.
	 */
	rotate(thetaX: number, thetaY: number, thetaZ: number, x = 0, y = 0, z = 0): Matrix {
		const rx = new Matrix();
		const cosx = Math.cos(thetaX / 180 * Math.PI);
		const sinx = Math.sin(thetaX / 180 * Math.PI);
		rx.matrix[5] = cosx;
		rx.matrix[9] = -sinx;
		rx.matrix[6] = sinx;
		rx.matrix[10] = cosx;

		const ry = new Matrix();
		const cosy = Math.cos(thetaY / 180 * Math.PI);
		const siny = Math.sin(thetaY / 180 * Math.PI);
		ry.matrix[10] = cosy;
		ry.matrix[2] = -siny;
		ry.matrix[8] = siny;
		ry.matrix[0] = cosy;

		const rz = new Matrix();
		const cosz = Math.cos(thetaZ / 180 * Math.PI);
		const sinz = Math.sin(thetaZ / 180 * Math.PI);
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
	 * @param sx Amount to scale in the x direction.
	 * @param sy Amount to scale in the y direction.
	 * @param sz Amount to scale in the z direction.
	 * @param x x coordinate of the point around which to scale. Defaults to 0.
	 * @param y y coordinate of the point around which to scale. Defaults to 0.
	 * @param z z coordinate of the point around which to scale. Defaults to 0.
	 *
	 * @return Result of scaling the current matrix.
	 */
	scale(sx: number, sy: number, sz: number, x: number = 0, y: number = 0, z: number = 0): Matrix {
		const s = new Matrix();
		s.matrix[0] = sx;
		s.matrix[5] = sy;
		s.matrix[10] = sz;

		return this.translate(x, y, z).mult(s).translate(-x, -y, -z);
	}

	/**
	 * Prints the matrix as an HTML table.
	 *
	 * @return HTML table with the contents of the matrix.
	 */
	asHTML(): string {
		let output = '<table>';

		for(let r = 0; r < 4; r++) {
			output += '<tr>';

			for(let c = 0; c < 4; c++) {
				output += `<td>${this.getValue(r, c).toFixed(2)}</td>`;
			}

			output += '</tr>';
		}

		output += '</table>';

		return output;
	}
}

