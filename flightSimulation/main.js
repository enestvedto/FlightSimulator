import './style.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { TessellateModifier } from 'three/examples/jsm/modifiers/TessellateModifier';
import { ObjectPool } from './ObjectPool';
import { Vector3 } from 'three';

// Initalization of variables
let scene, camera, renderer, controls, clock;

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


  camera = new THREE.PerspectiveCamera(45, game_canvas.clientWidth / game_canvas.clientHeight, 1, 2000);
  camera.name = 'camera';
  camera.position.z = 10;
  camera.position.y = 2;

  scene.add(camera);


  // Lighting

  light = new THREE.PointLight(0xFFFFFF, 1, 20, 1);
  camera.add(light);

  // Renderer


  renderer = new THREE.WebGLRenderer({ canvas: game_canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(game_canvas.clientWidth, game_canvas.clientHeight);

  /*GridHelper


  let HelperXZ = new THREE.GridHelper(100, 100);
  scene.add(HelperXZ);

  let HelperXY = new THREE.GridHelper(100, 100);
  HelperXY.rotation.x = Math.PI / 2;
  scene.add(HelperXY)

  */

  // Particle explosion
  // Random Boxes

  objectPool = new ObjectPool(500);
  objects = [];

  for (let i = 0; i < 500; i++) {

    const box = objectPool.getObject();

    box.position.x = getRndInteger(-25, 25);
    box.position.y = getRndInteger(-25, 25);
    box.position.z = getRndInteger(-25, 25);

    scene.add(box);
    objects.push(box);

  }

  // Collision Detection
  const cameraGeometry = new THREE.BoxGeometry(3, 3, 3);
  const cameraMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  cameraCube = new THREE.Mesh(cameraGeometry, cameraMaterial);
}

// Function to detect collisions between the camera and random boxes

function detectCollisions() {
  cameraCube.position.set(camera.position.x, camera.position.y, camera.position.z);
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

let delta = 0;

function initControls() {

  let instructions = document.getElementById('instructions');
  let blocker = document.getElementById('blocker');

  move = false;

  controls = new PointerLockControls(camera, document.body);

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

  flycontrols = new FlyControls(camera, document.body);

  flycontrols.autoForward = true;
  flycontrols.movementSpeed = 10;

}// end of initControls

/**
 *  loop is the main loop, responible for updating the canvas, 
 *  resetting the puzzle when complete.
 */
function loop() {
  delta += 0.3;

  objects.forEach(box => {
    box.material.uniforms.delta.value = Math.sin(delta);
  });

  detectCollisions();

  const deltaTime = clock.getDelta();

  requestAnimationFrame(loop);

  if (move) {
    flycontrols.update(deltaTime);
  }

  recycleObjects();

  renderer.render(scene, camera);

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

  //remove objects farther than 100 units

  for (let i = 0; i < objects.length; i++)
  {
    
    let box = objects[i];

    if (getDistance(cameraCube, box) > 65)
    {

      objectPool.releaseObject(box);

      scene.remove(box);

      let idx = objects.indexOf(box);
      objects.splice(idx, 1);

      i--;
    }
  }

  //place objects in new locations

  let box = objectPool.getObject();

  while (box != undefined)
  {

    box.position.x = getRndInteger(-50, 50) + cameraCube.position.x;
    box.position.y = getRndInteger(-50, 50) + cameraCube.position.y;
    box.position.z = getRndInteger(-50, 50) + cameraCube.position.z;

    scene.add(box);
    objects.push(box);

    box = objectPool.getObject();
  }

}

main();