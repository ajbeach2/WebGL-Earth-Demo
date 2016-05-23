import THREE from '../lib/three.js';
import CrateComponent from './components/crateComponent';
import SphereComponent from './components/sphereComponent';

import CameraSystem from './systems/cameraSystem';
import RenderSystem from './systems/renderSystem';
import ScriptSystem from './systems/scriptSystem';
import GuiSystem from './systems/guiSystem';

var scene = new THREE.Scene();
var crate = new SphereComponent();
var camera =  new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
var controls = new THREE.OrbitControls( camera );

var light = new THREE.DirectionalLight( 0xffffff, 0.5 );
light.position.set( 1, 0, 1 );
light.name = 'DirectionalLight';

camera.position.z = 200;

scene.add(camera);
scene.add(light);
scene.add(crate);

var renderSystem = new RenderSystem(scene);
var scriptSystem = new ScriptSystem(scene);
var cameraSystem = new CameraSystem(scene);
var guiSystem = new GuiSystem(scene);


scriptSystem.addScript(crate,'spin',function(){
  this.rotation.y += .001;
});

function animate() {
  scriptSystem.process();
  renderSystem.process();
  requestAnimationFrame( animate );
}

animate();