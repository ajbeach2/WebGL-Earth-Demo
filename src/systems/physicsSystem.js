import CubeComponent from '../components/cubeComponent';

class PhysicsSystem {
  constructor(entityManger){
    this.entityManger = entityManger;
  }

  process(){
    var entities = this.entityManger.query(CubeComponent);
    for(let entity of entities){
      var cube = entity.get(CubeComponent);
      cube.rotation.x += .01;
      cube.rotation.y += .01;
    }
  }
}
export default PhysicsSystem;