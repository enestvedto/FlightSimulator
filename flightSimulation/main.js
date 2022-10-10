import './style.css'
import * as THREE from 'three';

// Initalization of variables
let scene, camera, renderer;
let game_canvas = document.getElementById("myCanvas");
let deltaTime;

function main() {

  init();
  loop();

}

/**
 *  init creates the objects required for the game 
 *  and initializes the scene, as well as adding DOM listeners
 */
function init() {


  // Scene


  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);


  // Camera


  camera = new THREE.PerspectiveCamera(45, game_canvas.clientWidth / game_canvas.clientHeight, 1, 2000);
  camera.name = 'camera';
  camera.position.z = 10;


  // Renderer


  renderer = new THREE.WebGLRenderer({ canvas: game_canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(game_canvas.clientWidth, game_canvas.clientHeight);


}


/**
 *  loop is the main loop, responible for updating the canvas, 
 *  resetting the puzzle when complete.
 */
function loop(time) {
  requestAnimationFrame(loop);

  time *= 0.001;

  if (time == undefined)
    time = 0;

  deltaTime = time - deltaTime;

  render();

  deltaTime = time;
}

/**
 *  render is used to render all parts of the game.
 */
function render() {
  renderer.render(scene, camera);
}

main();