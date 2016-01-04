import THREE from '../lib/three.js';
import CrateComponent from './components/crateComponent';
import CameraSystem from './systems/cameraSystem';
import RenderSystem from './systems/renderSystem';

var scene = new THREE.Scene();
var crate = new CrateComponent(200);
var crate2 = new CrateComponent(20);
crate2.position.z = 200;

crate.add(crate2);
scene.add(crate);

var renderSystem = new RenderSystem(scene);
var cameraSystem = new CameraSystem(scene);
var physicsSystem = new PhysicsSystem(scene);

export function animate() {
  renderSystem.process( scene, cameraSystem.camera );
  requestAnimationFrame( animate );
}

animate();