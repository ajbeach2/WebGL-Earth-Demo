import THREE from 'three.js';
import makr from 'makr';

import CubeComponent from './components/cubeComponent';
import CameraSystem from './systems/cameraSystem';
import RenderSystem from './systems/renderSystem';
import SceneSystem from './systems/sceneSystem';


var em = makr(THREE.Scene, CubeComponent);
var ent1 = em.create();
ent1.add(new CubeComponent(200));

var renderSystem = new RenderSystem(em);
var cameraSystem = new CameraSystem(em);


var sceneSystem = new SceneSystem(em);


var camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 400;

export function animate() {
  renderSystem.process( sceneSystem.scene, cameraSystem.camera );
  cameraSystem.process();
  requestAnimationFrame( animate );
}


animate();