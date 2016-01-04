import THREE from '../../lib/three.js'

class SphereComponent extends THREE.Mesh {
  constructor(size) {
    var texture = THREE.ImageUtils.loadTexture('textures/earthMap.jpg');
    var geometry = new THREE.SphereGeometry( 64, 64, 64 );
    var material =  new THREE.MeshPhongMaterial();
    material.map = texture;
  
  	 material.bumpMap    = THREE.ImageUtils.loadTexture('textures/earthBump.jpg');
	   material.specularMap    = THREE.ImageUtils.loadTexture('textures/earthSpec.png');
	   material.bumpScale = 0.05
	   material.specular  = new THREE.Color('grey');

    super( geometry, material );
    this.name = name || this.constructor.name;
  }
}

export default SphereComponent;