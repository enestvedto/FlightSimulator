import './style.css'
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';

// Initalization of variables
let scene, camera, renderer, controls, clock, move, flycontrols, cameraCube, collisions;
let game_canvas = document.getElementById("myCanvas");

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function main() {

  init();
  loop();

}

/**
 *  init creates the objects required for the game 
 *  and initializes the scene, as well as adding DOM listeners
 */
function init() {

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


  // Geometry
  let sphere = new THREE.SphereGeometry(1.5, 20, 16);

  // Material
  let materialOne = new THREE.MeshBasicMaterial({
    color: 0xFF0000,
  });

  // Mesh
  let mesh = new THREE.Mesh(sphere, materialOne);
  scene.add(mesh);

  // Renderer


  renderer = new THREE.WebGLRenderer({ canvas: game_canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(game_canvas.clientWidth, game_canvas.clientHeight);

  //GridHelper


  let HelperXZ = new THREE.GridHelper(100, 100);
  scene.add(HelperXZ);

  let HelperXY = new THREE.GridHelper(100, 100);
  HelperXY.rotation.x = Math.PI / 2;
  scene.add(HelperXY)

  // Controls


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

  flycontrols.autoForward = false;
  flycontrols.movementSpeed = 10;

  // Random Boxes

  const boxGeometry = new THREE.BoxGeometry(2, 2, 2).toNonIndexed();

  const objects = [];
  collisions = [];

  for (let i = 0; i < 500; i++) {

    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF0000,
    });

    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.x = getRndInteger(-50, 50);
    box.position.y = getRndInteger(-50, 50);
    box.position.z = getRndInteger(-50, 50);

    box.geometry.computeBoundingBox();
    box.updateMatrixWorld();
    var bb = box.geometry.boundingBox.clone();
    bb.applyMatrix4(box.matrixWorld);

    collisions.push(bb);

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
  var cbb = cameraCube.geometry.boundingBox.clone();
  cbb.applyMatrix4(cameraCube.matrixWorld);

  collisions.forEach(bb => {
    if (cbb.intersectsBox(bb)) {
      camera.position.set(0, 0, 0);
    }
  });
}

/**
 *  loop is the main loop, responible for updating the canvas, 
 *  resetting the puzzle when complete.
 */
function loop(time) {

  const delta = clock.getDelta();

  requestAnimationFrame(loop);

  detectCollisions();

  if (move) {
    flycontrols.update(delta);
  }

  render();

}

/**
 *  render is used to render all parts of the game.
 */
function render() {
  renderer.render(scene, camera);
}

main();