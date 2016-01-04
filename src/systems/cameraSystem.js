import THREE from '../../lib/three.js';

class CameraSystem {

  constructor (scene){
    this.scene = scene;
    this.activeCamera = scene.getObjectByProperty('type', 'PerspectiveCamera');
    this.events();
  }

  events(){
    var that = this;
    window.addEventListener( 'resize',function(){
      that.activeCamera.aspect = window.innerWidth / window.innerHeight;
      that.update();
    } , false );
  }

  update(){
    this.activeCamera.updateProjectionMatrix();
  }
}
export default CameraSystem;

