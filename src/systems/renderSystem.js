import THREE from '../../lib/three.js'

class RenderSystem {
  constructor(scene){
    this.scene = scene;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    var that = this;
    var onWindowResize = function() {
      that.renderer.setSize( window.innerWidth, window.innerHeight );
    }
    window.addEventListener( 'resize', onWindowResize, false );

    this.activeCamera = scene.getObjectByProperty('type', 'PerspectiveCamera');
  }

  process(){
    this.renderer.render( this.scene, this.activeCamera);
  }
}
export default RenderSystem;