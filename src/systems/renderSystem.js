import THREE from '../../lib/three.js'

class RenderSystem {
  constructor(){
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    var that = this;
    var onWindowResize = function() {
      that.renderer.setSize( window.innerWidth, window.innerHeight );
    }
    window.addEventListener( 'resize', onWindowResize, false );
  }
  
  process(scene,camera){
    this.renderer.render( scene, camera);
  }
}
export default RenderSystem;