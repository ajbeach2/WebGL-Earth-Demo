import THREE from '../../lib/three.js'

class CrateComponent extends THREE.Mesh {
  constructor(size) {
    var texture = THREE.ImageUtils.loadTexture( 'textures/crate.gif');
    var geometry = new THREE.BoxGeometry( size, size, size );
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    super( geometry, material );
    this.name = name || this.constructor.name;
  }
}

export default CrateComponent;