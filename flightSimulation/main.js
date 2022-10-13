import './style.css'
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { BoxObject } from './GameObject';
import CannonDebugger from 'cannon-es-debugger';

import { PointerLockControls } from './PointerLockControls.js';

// Initalization of variables
let scene, camera, renderer, clock;

let physicsWorld, physicsDebugger;
let timeStep = 1/60;

let gameObjects, playerObject;

let controls;

let light;
let game_canvas = document.getElementById("myCanvas");

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function main() {

  initPhysicsWorld();
  initGraphicsWorld();

  init();

  initControls();

  loop();

}


function initPhysicsWorld() {

  physicsWorld = new CANNON.World({
    gravity: new CANNON.Vec3(0, 0, 0)
  });

  gameObjects = [];

  playerObject = new CANNON.Body({ type: CANNON.BODY_TYPES.KINEMATIC })
  playerObject.addShape(new CANNON.Sphere(1));
  physicsWorld.addBody(playerObject);
}

function initGraphicsWorld() {


  // Clock


  clock = new THREE.Clock();


  // Scene


  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);


  // Camera


  camera = new THREE.PerspectiveCamera(45, game_canvas.clientWidth / game_canvas.clientHeight, 1, 2000);
  camera.name = 'camera';

  // Lighting


  light = new THREE.PointLight(0xFFFFFF, 1, 20, 1);
  camera.add(light);


  // Renderer

  renderer = new THREE.WebGLRenderer({ canvas: game_canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(game_canvas.clientWidth, game_canvas.clientHeight);

} //end of initGraphics

/**
 *  init creates the objects required for the game 
 *  and initializes the scene, as well as adding DOM listeners
 */
function init() {

  // Debugger

  physicsDebugger = new CannonDebugger(scene, physicsWorld, {
    color: 0xff0000,
  });

  // Random Boxes

    gameObjects = [];
  
    for (let i = 0; i < 500; i++) {
  
      let x = getRndInteger(-50, 50);
      let y = getRndInteger(-50, 50);
      let z = getRndInteger(-50, 50);

      const box = new BoxObject(undefined, undefined, new THREE.Vector3(x,y,z));
  
      scene.add(box.graphicsObject);
      physicsWorld.addBody(box.physicsObject);

      gameObjects.push(box);

    }
}

function initControls() {

    let instructions = document.getElementById('instructions');
    let blocker = document.getElementById('blocker');

    controls = new PointerLockControls(camera, playerObject);
    scene.add(controls.getObject());
  
    instructions.addEventListener('click', function () {
  
      controls.lock();
  
    });
  
    controls.addEventListener('lock', function () {
  
      instructions.style.display = 'none';
      blocker.style.display = 'none';
      controls.enabled = true;

    });
  
    controls.addEventListener('unlock', function () {
  
      blocker.style.display = 'block';
      instructions.style.display = '';
      controls.enabled = false;

    });
}


/**
 *  loop is the main loop, responible for updating the canvas, 
 *  resetting the puzzle when complete.
 */
function loop() {

  const delta = clock.getDelta();

  if (controls.enabled)
    physicsWorld.step(timeStep, delta);

  physicsDebugger.update();

  gameObjects.forEach(gameObject => {
    gameObject.graphicsObject.position.copy(gameObject.physicsObject.position);
    gameObject.graphicsObject.quaternion.copy(gameObject.physicsObject.quaternion);
  });

  controls.update(delta);
  renderer.render(scene, camera);

  requestAnimationFrame(loop);
}

main();