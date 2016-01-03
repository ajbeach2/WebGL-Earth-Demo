import THREE from 'three.js';

class CameraSystem {

  constructor (entityManager){
    this.entityManager = entityManager;
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
      that.camera.aspect = window.innerWidth / window.innerHeight;
    } , false );
  }
  
  process(){
    this.camera.updateProjectionMatrix();
  }
}
export default CameraSystem;

