/**
 * This is the final submission of project 2.
 * Authors: Owen and Tones
 * 
 * ABOVE AND BEYOND
 * - - - - - - - - - - - - - - - - - - - - - - 
 * We have made explosions, a visual effect when you are not locked in on the screen,
 * and the screen turns red using html/css elements.
 */

import './style.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { ObjectPool } from './ObjectPool';
import { ScissorTool } from './ScissorTool';
import { MathUtils } from 'three';

let scene, frontCamera, rearCamera, renderer, controls, clock;

let scissorTool;

let objects, objectPool, cameraCube;
const NUM_OBJECTS = 75;

let move, flycontrols;

let damage = document.getElementById('collision');
damage.style.display = 'none';
let damageOn;

let game_canvas = document.getElementById("myCanvas");

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
} //end of getRndInteger

function main() {

  initGraphics();

  initControls();

  loop();

} //end of main

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

  rearCamera = new THREE.PerspectiveCamera(45, game_canvas.clientWidth / game_canvas.clientHeight, 1, 2000);ScissorTool
  rearCamera.rotation.y = Math.PI;
  rearCamera.name = 'rearCamera';

  frontCamera.add(rearCamera);


  // Renderer


  renderer = new THREE.WebGLRenderer({ canvas: game_canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(game_canvas.clientWidth, game_canvas.clientHeight);

  let context = renderer.getContext();

  context.depthFunc(context.ALWAYS);


  // ScissorTool


  let rearViewRatio = new THREE.Vector2(0.3, 0.3); //size of rear camera on screen (w, h)

  scissorTool = new ScissorTool(renderer);
  scissorTool.setPosFromBottomLeft(game_canvas.clientWidth * (1 - rearViewRatio.x), 0);
  scissorTool.setWidth(Math.round(game_canvas.clientWidth * rearViewRatio.x));
  scissorTool.setHeight(Math.round(game_canvas.clientHeight * rearViewRatio.y));


  // Particle explosion
  // Random Boxes

  objectPool = new ObjectPool(NUM_OBJECTS);
  objects = [];

  for (let i = 0; i < NUM_OBJECTS; i++) {

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

} //end of initGraphics

/**
 * Updates the the scenes objects a timestep of delta
 * @param {number} delta -> time since last step
 */
function updateWorld(delta) {
  for (let i = 0; i < objects.length; i++) {
    let object = objects[i];
    let velocity = object.userData['velocity'].clone(); //clone to not overwrite
    let rotation = object.userData['rotation'].clone();

    velocity.multiplyScalar(delta);
    object.position.add(velocity);

    rotation.multiplyScalar(delta);
    object.rotation.x += rotation.x;
    object.rotation.y += rotation.y;
    object.rotation.z += rotation.z;
    
  }
} //end of updateWorld

/**
 * Sets up the controllers we are using for camera movement in space
 */
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
    damageOn = true;
  });

  controls.addEventListener('unlock', function () {

    blocker.style.display = 'block';
    instructions.style.display = '';
    move = false;
    damageOn = false;
  });

  flycontrols = new FlyControls(frontCamera, document.body);

  flycontrols.autoForward = true;
  flycontrols.movementSpeed = 15;

}// end of initControls

/**
 * Function to detect collisions between the camera and random boxes
*/
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
    if (damageOn) {
      if (cbb.intersectsBox(bb)) {
        damageShip();
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

  }
} //end of detectCollisions

/**
 * Applies screen effect for damage
 */
async function damageShip() {
  damage.style.display = 'block';
  await delay(50);
  damage.style.display = 'none';
} //end of damageShip

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
} //end of delay


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
  });

  detectCollisions();

  requestAnimationFrame(loop);

  if (move) {
    flycontrols.update(deltaTime * .5);
  }

  recycleObjects();

  render();

} //end of loop

function render() {

  //render normal camera
  renderer.render(scene, frontCamera);

  //render rear camera
  scissorTool.toggleScissor();
  renderer.render(scene, rearCamera);
  scissorTool.toggleScissor();

} //end of render

/**
 * Gets the distance from o1 to o2
 * @param {THREE.Mesh} o1 
 * @param {THREE.Mesh} o2 
 */
function getDistance(o1, o2) {
  let c1 = new THREE.Vector3();
  let c2 = new THREE.Vector3();

  o1.geometry.boundingBox.getCenter(c1);
  o2.geometry.boundingBox.getCenter(c2);

  return c1.distanceTo(c2);

} //end of getDistance

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
    box.userData.rotation = new THREE.Vector3(MathUtils.randFloatSpread(Math.PI), MathUtils.randFloatSpread(Math.PI), MathUtils.randFloatSpread(Math.PI));

    scene.add(box);
    objects.push(box);

    box = objectPool.getObject();
  }

} //end of recycleObjects

main();