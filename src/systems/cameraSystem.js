import THREE from '../../lib/three.js';

class CameraSystem {

  constructor (scene){
    this.scene = scene;
    this.init();
    this.events();
  }

  init(){
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    this.camera.position.z = 400;
  }

  events(){
    var that = this;
    window.addEventListener( 'resize',function(){
      console.log('here');
      that.camera.aspect = window.innerWidth / window.innerHeight;
      that.process();
    } , false );
  }

  process(){
    this.camera.updateProjectionMatrix();
  }
}
export default CameraSystem;

