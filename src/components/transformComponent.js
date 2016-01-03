import THREE from 'three.js';

class TransformComponent {
  constructor(rotation,position){
    this.rotation = rotation || new THREE.Vector3();
    this.position = position || new THREE.Vector3();
  }
}

export default TransformComponent;