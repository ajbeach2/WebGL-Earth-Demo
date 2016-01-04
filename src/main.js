import THREE from '../lib/three.js';
import CrateComponent from './components/crateComponent';
import SphereComponent from './components/sphereComponent';

import CameraSystem from './systems/cameraSystem';
import RenderSystem from './systems/renderSystem';
import ScriptSystem from './systems/scriptSystem';

var scene = new THREE.Scene();
var crate = new SphereComponent();
var camera =  new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
var controls = new THREE.OrbitControls( camera );
var ambientLight = new THREE.AmbientLight( 0x000000 );
var light = new THREE.PointLight( 0xffffff, 1, 0 );

light.position.z = 200;
camera.position.z = 200;

scene.add(camera);
scene.add(ambientLight);
scene.add(light);
scene.add(crate);

var renderSystem = new RenderSystem(scene);
var scriptSystem = new ScriptSystem(scene);
var cameraSystem = new CameraSystem(scene);


scriptSystem.addScript(crate,'spin',function(){
  this.rotation.y += .01;
});

function animate() {
  scriptSystem.process();
  renderSystem.process();
  requestAnimationFrame( animate );
}

animate();