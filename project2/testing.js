/* eslint-disable no-unused-vars */
/* global Cube Tetra Camera */

function testGetSize () {
    console.log('get size: ');
    let tetra1 = new Tetra();
    tetra1.resize(2, 3, 4);
    console.log(tetra1.getSize());
    tetra1.resize(1, -2, 4);
    console.log(tetra1.getSize());
}

function testGetLocation () {
    console.log('get location: ');
    let tetra1 = new Tetra();
    tetra1.move(2, 3, 4);
    console.log(tetra1.getLocation());
    tetra1.move(1, -2, 4);
    console.log(tetra1.getLocation());
}

function testGetOrientation () {
    console.log('get orientation: ');
    let tetra1 = new Tetra();
    tetra1.orient(2, 3, 4);
    console.log(tetra1.getOrientation());
    tetra1.orient(1, -2, 4);
    console.log(tetra1.getOrientation());
}

function testOrtho(left, right, bottom, top, near, far) {
    let testCamera = new Camera();
    console.log(testCamera.ortho(left, right, bottom, top, near, far));
}

function testFrustum(left, right, bottom, top, near, far) {
    let testCamera = new Camera();
    console.log(testCamera.frustum(left, right, bottom, top, near, far));
}

function testLookAt(eyeLocation, locatingBeingLookedAt, upVector) {
    let testCamera = new Camera();
    console.log(testCamera.lookAt(eyeLocation, locatingBeingLookedAt, upVector));
}

function testViewPoint(location, viewNormalVector, upVector) {
    let testCamera = new Camera();
    console.log(testCamera.viewPoint(location, viewNormalVector, upVector));
}
