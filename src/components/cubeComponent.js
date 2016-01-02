import THREE from 'three.js'

class CubeComponent extends THREE.Mesh {
  constructor(size) {
    var texture = THREE.ImageUtils.loadTexture( 'textures/crate.gif');
    var geometry = new THREE.BoxGeometry( size, size, size );
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    super( geometry, material );
  }
}

export default CubeComponent;