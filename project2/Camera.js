/* global Matrix Vector */
/* eslint no-unused-vars: ["warn", { "varsIgnorePattern": "Camera" }] */

class Camera {
    /**
	 * Camera has perspective and orthographic projections
	 * along with lookAt and viewpoint
	 */
    constructor() {
        this.currentProjection = new Matrix();
        this.currentView = new Matrix();
    }

    /**
	 * returns the current view
	 */
    getView() {
        return this.currentView;
    }

    /**
	 * returns the current projection
	 */
    getProjection() {
        return this.currentProjection;
    }

    /**
	 * construction of the orthographic projection
	 * @param {number} left
	 * @param {number} right
	 * @param {number} bottom
	 * @param {number} top
	 * @param {number} near
	 * @param {number} far
	 */
    ortho(left, right, bottom, top, near, far) {
        let ortho = [
            2 / (right - left), 0, 0, -(right + left) / (right - left),
            0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom),
            0, 0, -2 / (far - near), -(far + near) / (far - near),
            0, 0, 0, 1
        ];

        // let ortho = [
        // 	2 / (right - left), 0, 0, 0,
        // 	0, 2 / (top - bottom), 0, 0,
        // 	0, 0, -2 / (far - near), 0,
        // 	-(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1
        // ];

        this.currentProjection = new Matrix(ortho);
        return this.currentProjection;
    }

    /**
	 * consturction of the perspective projection
	 * @param {number} left
	 * @param {number} right
	 * @param {number} bottom
	 * @param {number} top
	 * @param {number} near
	 * @param {number} far
	 */
    frustum(left, right, bottom, top, near, far) {
        let frustom = [
            2 * near / (right - left), 0, (right + left) / (right - left), 0,
            0, 2 * near / (top - bottom), (top + bottom) / (top - bottom), 0,
            0, 0, -(far + near) / (far - near), -2 * far * near / (far - near),
            0, 0, -1, 0
        ];

        // let frustom = [
        // 	2 * near / (right - left), 0, 0, 0,
        // 	0, 2 * near / (top - bottom), 0, 0,
        // 	(right + left) / (right - left), (top + bottom) / (top - bottom), -(far + near) / (far - near), -1,
        // 	0, 0, -2 * far * near / (far - near), 0
        // ];

        this.currentProjection = new Matrix(frustom);
        return this.currentProjection;
    }

    /**
	 * @param {Vector} eyeLocation location of the eye
	 * @param {Vector} locatingBeingLookedAt the location that is being looked at
	 * @param {Vector} upVector the orientation of the camera
	 * @returns {Matrix} new projection matrix
	 */
    lookAt(eyeLocation, locatingBeingLookedAt, upVector) {
        let n = new Vector([
            eyeLocation.getX() - locatingBeingLookedAt.getX(),
            eyeLocation.getY() - locatingBeingLookedAt.getY(),
            eyeLocation.getZ() - locatingBeingLookedAt.getZ()
        ]);
        let nPrime = n;
        nPrime.normalize();
        let u = upVector.crossProduct(nPrime);
        // let u = nPrime.crossProduct(upVector);
        let uPrime = u;
        uPrime.normalize();
        // let v = uPrime.crossProduct(nPrime);
        let v = nPrime.crossProduct(uPrime);
        let vPrime = v;
        vPrime.normalize();

        let lookAt = [
            uPrime.getX(), vPrime.getX(), nPrime.getX(), -eyeLocation.getX() * uPrime.getX() - eyeLocation.getY() * uPrime.getY() - eyeLocation.getZ() * uPrime.getZ(),
            uPrime.getY(), vPrime.getY(), nPrime.getY(), -eyeLocation.getX() * vPrime.getX() - eyeLocation.getY() * vPrime.getY() - eyeLocation.getZ() * vPrime.getZ(),
            uPrime.getZ(), vPrime.getZ(), nPrime.getZ(), -eyeLocation.getX() * nPrime.getX() - eyeLocation.getY() * nPrime.getY() - eyeLocation.getZ() * nPrime.getZ(),
            0, 0, 0, 1
        ];

        // let lookAt = [
        // 	uPrime.getX(), uPrime.getY(), uPrime.getZ(), 0,
        // 	vPrime.getX(), vPrime.getY(), vPrime.getZ(), 0,
        // 	nPrime.getX(), nPrime.getY(), nPrime.getZ(), 0,
        // 	-eyeLocation.getX() * uPrime.getX() - eyeLocation.getY() * uPrime.getY() - eyeLocation.getZ() * uPrime.getZ(),
        // 	-eyeLocation.getX() * vPrime.getX() - eyeLocation.getY() * vPrime.getY() - eyeLocation.getZ() * vPrime.getZ(),
        // 	-eyeLocation.getX() * nPrime.getX() - eyeLocation.getY() * nPrime.getY() - eyeLocation.getZ() * nPrime.getZ(), 1
        // ];

        this.currentView = new Matrix(lookAt);
        return this.currentView;
    }

    /**
	 * @param {Vector} location the location of the camera
	 * @param {Vector} viewNormalVector where the camera is pointing
	 * @param {Vector} upVector the orientation of the camera
	 * @returns {Matrix} updated view
	 */
    viewPoint(location, viewNormalVector, upVector) {
        let nPrime = viewNormalVector;
        nPrime.normalize();
        let v = (upVector.dotProduct(nPrime));
        v = new Vector([
            upVector.getX() - v * nPrime.getX(),
            upVector.getY() - v * nPrime.getY(),
            upVector.getZ() - v * nPrime.getZ()
        ]);
        let vPrime = v;
        vPrime.normalize();
        // let uPrime = nPrime.crossProduct(vPrime);
        let uPrime = vPrime.crossProduct(nPrime);

        let viewPoint = [
            uPrime.getX(), vPrime.getX(), nPrime.getX(), -location.getX() * uPrime.getX() - location.getY() * uPrime.getY() - location.getZ() * uPrime.getZ(),
            uPrime.getY(), vPrime.getY(), nPrime.getY(), -location.getX() * vPrime.getX() - location.getY() * vPrime.getY() - location.getZ() * vPrime.getZ(),
            uPrime.getZ(), vPrime.getZ(), nPrime.getZ(), -location.getX() * nPrime.getX() - location.getY() * nPrime.getY() - location.getZ() * nPrime.getZ(),
            0, 0, 0, 1
        ];

        // let viewPoint = [
        // 	uPrime.getX(), uPrime.getY(), uPrime.getZ(), 0,
        // 	vPrime.getX(), vPrime.getY(), vPrime.getZ(), 0,
        // 	nPrime.getX(), nPrime.getY(), nPrime.getZ(), 0,
        // 	-location.getX() * uPrime.getX() - location.getY() * uPrime.getY() - location.getZ() * uPrime.getZ(),
        // 	-location.getX() * vPrime.getX() - location.getY() * vPrime.getY() - location.getZ() * vPrime.getZ(),
        // 	-location.getX() * nPrime.getX() - location.getY() * nPrime.getY() - location.getZ() * nPrime.getZ(), 1
        // ];

        this.currentView = new Matrix(viewPoint);
        return this.currentView;
    }
}
