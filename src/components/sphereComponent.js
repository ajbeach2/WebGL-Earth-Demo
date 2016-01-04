import THREE from '../../lib/three.js'

class SphereComponent extends THREE.Mesh {
  constructor(size) {
    var texture = THREE.ImageUtils.loadTexture('textures/earthmap1k.jpg');
    var geometry = new THREE.SphereGeometry( 64, 64, 64 );
    var material =  new THREE.MeshPhongMaterial();
    material.map = texture;
  
    super( geometry, material );
    this.name = name || this.constructor.name;
  }
}

export default SphereComponent;