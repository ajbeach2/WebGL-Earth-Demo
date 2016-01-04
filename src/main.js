import THREE from '../lib/three.js';
import CrateComponent from './components/crateComponent';
import CameraSystem from './systems/cameraSystem';
import RenderSystem from './systems/renderSystem';
import ScriptSystem from './systems/scriptSystem';

var scene = new THREE.Scene();
var crate = new CrateComponent(200);

scene.add(crate);

var renderSystem = new RenderSystem(scene);
var cameraSystem = new CameraSystem(scene);
var scriptSystem = new ScriptSystem(scene);


scriptSystem.addScript(crate,"spin",function(){
  this.rotation.x += .01;
});

function animate() {
  scriptSystem.process();
  renderSystem.process( scene, cameraSystem.camera );
  requestAnimationFrame( animate );
}

animate();