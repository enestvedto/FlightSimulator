import './style.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { ObjectPool } from './ObjectPool';
import { Vector3, Vector4 } from 'three';
import { ScissorTool } from './ScissorTool';
import { MathUtils } from 'three';

// Initalization of variables
let scene, frontCamera, rearCamera, renderer, controls, clock;

let scissorTool;

let objects, objectPool, cameraCube;

let move, flycontrols;

let light;

let game_canvas = document.getElementById("myCanvas");

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function main() {

  initGraphics();

  initControls();
  loop();

}

/**
 *  init creates the objects required for the game 
 *  and initializes the scene, as well as adding DOM listeners
 */
function initGraphics() {

  // Clock


  clock = new THREE.Clock();


  // Scene


  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);


  // Camera


  frontCamera = new THREE.PerspectiveCamera(45, game_canvas.clientWidth / game_canvas.clientHeight, 1, 2000);
  frontCamera.name = 'frontCamera';
  frontCamera.position.z = 10;
  frontCamera.position.y = 2;

  scene.add(frontCamera);

  rearCamera = new THREE.PerspectiveCamera(45, game_canvas.clientWidth / game_canvas.clientHeight, 1, 2000);
  rearCamera.rotation.y = Math.PI;
  rearCamera.name = 'rearCamera';

  frontCamera.add(rearCamera);


  // Lighting

  light = new THREE.PointLight(0xFFFFFF, 1, 20, 1);
  frontCamera.add(light);

  // Renderer


  renderer = new THREE.WebGLRenderer({ canvas: game_canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(game_canvas.clientWidth, game_canvas.clientHeight);


  // ScissorTool


  let rearViewRatio = new THREE.Vector2(0.3, 0.3); //size of rear camera on screen (w, h)

  scissorTool = new ScissorTool(renderer);
  scissorTool.setPosFromBottomLeft(game_canvas.clientWidth * (1 - rearViewRatio.x), 0);
  scissorTool.setWidth(Math.round(game_canvas.clientWidth * rearViewRatio.x));
  scissorTool.setHeight(Math.round(game_canvas.clientHeight * rearViewRatio.y));


  /*GridHelper


  let HelperXZ = new THREE.GridHelper(100, 100);
  scene.add(HelperXZ);

  let HelperXY = new THREE.GridHelper(100, 100);
  HelperXY.rotation.x = Math.PI / 2;
  scene.add(HelperXY)

  */

  // Particle explosion
  // Random Boxes
  var numObjects = 75;
  objectPool = new ObjectPool(numObjects);
  objects = [];

  for (let i = 0; i < numObjects; i++) {

    const box = objectPool.getObject();

    box.position.x = getRndInteger(-25, 25);
    box.position.y = getRndInteger(-25, 25);
    box.position.z = getRndInteger(-25, 25);

    box.material.uniforms.u_resolution.value.x = renderer.domElement.width;
    box.material.uniforms.u_resolution.value.y = renderer.domElement.height;

    scene.add(box);
    objects.push(box);

  }

  // Collision Detection
  const cameraGeometry = new THREE.BoxGeometry(3, 3, 3);
  const cameraMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  cameraCube = new THREE.Mesh(cameraGeometry, cameraMaterial);
}

/**
 * Updates the the scenes objects a timestep of delta
 * @param {number} delta -> time since last step
 */
function updateWorld(delta) {
  for (let i = 0; i < objects.length; i++) {
    let object = objects[i];
    let velocity = object.userData['velocity'].clone(); //clone to not overwrite
    let oldRotation = object.userData['rotation'];
    let newRotation = oldRotation.clone();

    velocity.multiplyScalar(delta);
    object.position.add(velocity);

    /*
    newRotation.multiplyScalar(delta);  NEEED TO FIX SO ROTATION OCCURS
    newRotation.add(oldRotation);
    
    object.rotation.setFromVector3(newRotation);
    */
  }
}


// Function to detect collisions between the camera and random boxes

function detectCollisions() {
  cameraCube.position.set(frontCamera.position.x, frontCamera.position.y, frontCamera.position.z);
  cameraCube.geometry.computeBoundingBox();
  cameraCube.updateMatrixWorld();

  var cbb = cameraCube.geometry.boundingBox;
  cbb.applyMatrix4(cameraCube.matrixWorld);

  for (let i = 0; i < objects.length; i++) {
    let box = objects[i];
    box.geometry.computeBoundingBox();
    box.updateMatrixWorld();

    var bb = box.geometry.boundingBox;
    bb.applyMatrix4(box.matrixWorld);

    if (cbb.intersectsBox(bb)) {
      box.material.uniforms.amplitude.value += 0.1;
      if (box.material.uniforms.amplitude.value > 1) {
        scene.remove(box);
        box.material.uniforms.amplitude.value = 0;

        objectPool.releaseObject(box);

        let idx = objects.indexOf(box);
        objects.splice(idx, 1);
        i--;
      }
    }

  }
} //end of detectCollisions

function initControls() {

  let instructions = document.getElementById('instructions');
  let blocker = document.getElementById('blocker');

  move = false;

  controls = new PointerLockControls(frontCamera, document.body);

  instructions.addEventListener('click', function () {

    controls.lock();

  });

  controls.addEventListener('lock', function () {

    instructions.style.display = 'none';
    blocker.style.display = 'none';
    move = true;
  });

  controls.addEventListener('unlock', function () {

    blocker.style.display = 'block';
    instructions.style.display = '';
    move = false;
  });

  flycontrols = new FlyControls(frontCamera, document.body);

  flycontrols.autoForward = true;
  flycontrols.movementSpeed = 15;

}// end of initControls

/**
 *  loop is the main loop, responible for updating the canvas, 
 *  resetting the puzzle when complete.
 */
function loop() {

  const deltaTime = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  updateWorld(deltaTime);

  objects.forEach(item => {
    item.material.uniforms.delta.value = elapsedTime;
    item.rotation.x += Math.random() * 0.01;
    item.rotation.y += Math.random() * 0.01;
  });

  detectCollisions();

  requestAnimationFrame(loop);

  if (move) {
    flycontrols.update(deltaTime * .5);
  }

  recycleObjects();

  render();

}

/**
 * Gets the distance from o1 to o2
 * @param {THREE.Mesh} o1 
 * @param {THREE.Mesh} o2 
 */
function getDistance(o1, o2) {
  let c1 = new Vector3();
  let c2 = new Vector3();

  o1.geometry.boundingBox.getCenter(c1);
  o2.geometry.boundingBox.getCenter(c2);

  return c1.distanceTo(c2);

}

function recycleObjects() {

  //remove objects farther than 65 units

  for (let i = 0; i < objects.length; i++) {

    let box = objects[i];

    if (getDistance(cameraCube, box) > 65) {

      objectPool.releaseObject(box);

      scene.remove(box);

      let idx = objects.indexOf(box);
      objects.splice(idx, 1);

      i--;
    }
  }

  //place objects in new locations

  let box = objectPool.getObject();

  while (box != undefined) {

    box.position.x = getRndInteger(-50, 50) + cameraCube.position.x;
    box.position.y = getRndInteger(-50, 50) + cameraCube.position.y;
    box.position.z = getRndInteger(-50, 50) + cameraCube.position.z;

    box.userData.velocity = new THREE.Vector3(MathUtils.randFloatSpread(4), MathUtils.randFloatSpread(4), MathUtils.randFloatSpread(4));

    scene.add(box);
    objects.push(box);

    box = objectPool.getObject();
  }

} //end of recycle()

function render() {

  //render normal camera
  renderer.render(scene, frontCamera);

  //render rear camera
  scissorTool.toggleScissor();
  renderer.render(scene, rearCamera);
  scissorTool.toggleScissor();

}

main();