import './style.css'
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { TessellateModifier } from 'three/examples/jsm/modifiers/TessellateModifier';
import { ObjectPool } from './ObjectPool';

// Initalization of variables
let scene, camera, renderer, controls, clock;

let objects, objectPool, cameraCube;

let move, flycontrols;

let light;
let customUniforms;

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
  const tessellateModifier = new TessellateModifier(0.2, 5);

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

  objectPool = new ObjectPool(10);
  objects = [];

  for (let i = 0; i < 10; i++) {

    const box = objectPool.getObject();


    /*

    boxGeometry = tessellateModifier.modify(boxGeometry);

    
    const numFaces = boxGeometry.attributes.position.count / 3;
    const displacement = new Float32Array(numFaces * 3 * 3);
    
    for (let f = 0; f < numFaces; f++) {
      const index = 9 * f;
      const d = 10 * (0.5 - Math.random());

      for (let i = 0; i < 3; i++) {
        displacement[index + (3 * i)] = d;
        displacement[index + (3 * i) + 1] = d;
        displacement[index + (3 * i) + 2] = d;
      }
    }
    boxGeometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 3));


    customUniforms = {
      amplitude: { value: 0.0 },
      delta: { value: 0 },
    };

    var boxMaterial = new THREE.ShaderMaterial({
      uniforms: customUniforms,
      vertexShader: document.getElementById('vertexShader').textContent,
    });

    */

    box.position.x = getRndInteger(-25, 25);
    box.position.y = getRndInteger(-25, 25);
    box.position.z = getRndInteger(-25, 25);
    //boxGeometry = tessellateModifier.modify(boxGeometry);

    scene.add(box);
    objects.push(box);

  }

  console.log(objects);

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
      /*box.material.uniforms.amplitude.value += 0.1;
      if (box.material.uniforms.amplitude.value > 1) {
        scene.remove(box);
        box.material.uniforms.amplitude.value = 0;
      }
      */

      scene.remove(box);
      objectPool.releaseObject(box);

      let idx = objects.indexOf(box);
      objects.splice(idx, 1);

      console.log(box.geometry.boundingBox, objectPool.freeObjects.length);
      console.log(objects);
      i--;

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

  /*objects.forEach(box => {
    box.material.uniforms.delta.value = Math.sin(delta);
  }); */

  detectCollisions();

  const deltaTime = clock.getDelta();

  requestAnimationFrame(loop);

  if (move) {
    flycontrols.update(deltaTime);
  }

  renderer.render(scene, camera);

}

main();