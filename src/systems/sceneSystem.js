import CubeComponent from '../components/cubeComponent';
import THREE from 'three.js';

class SceneSystem {
  constructor(entityManager){
    this.entityManager = entityManager;
    this.scene = new THREE.Scene();
    this.init();
  }

  init(){
    var entities = this.entityManager.query(CubeComponent);
    for(let entity of entities){
      this.scene.add(entity.get(CubeComponent));
    }
  }
}

export default SceneSystem;