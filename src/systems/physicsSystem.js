import CANNON from 'cannon';
import CubeComponent from '../components/cubeComponent'

export function spin(entities){
  for(let entity of entities){
    var cube = entity.get(CubeComponent);
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.01;
  }
}