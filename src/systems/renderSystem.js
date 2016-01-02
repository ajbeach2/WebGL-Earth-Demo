import THREE from 'three.js';
import CubeComponent from '../components/cubeComponent';
import TargetComponent from '../components/targetComponent';
import {spin} from '../systems/physicsSystem';

var makr = require('makr');

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


var em = makr(THREE.PerspectiveCamera, THREE.Scene, CubeComponent,TargetComponent);
var ent1 = em.create();
    ent1.add(new CubeComponent(200));

var ent2 = em.create();
    var camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 400;
    ent2.add(camera);

var scene = new THREE.Scene();

for(let mesh of em.query(CubeComponent)) {
  scene.add(mesh.get(CubeComponent));
}
ent2.add(scene);

function onWindowResize() {
  for(let camera of em.query(THREE.Scene,THREE.PerspectiveCamera)){
    var cam = camera.get(THREE.PerspectiveCamera)
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
  }
  renderer.setSize( window.innerWidth, window.innerHeight );
}


window.addEventListener( 'resize', onWindowResize, false );

export function animate() {
  requestAnimationFrame( animate );

  spin(em.query(CubeComponent));

  for(let render of em.query(THREE.Scene,THREE.PerspectiveCamera)){
    var camera = render.get(THREE.PerspectiveCamera),
        scene = render.get(THREE.Scene);
    renderer.render( scene, camera );
  }
}

