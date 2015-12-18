import THREE from 'three.js';

class Box {
	static create(entityManager){
		var box = entityManager.create();
		box.add(new THREE.BoxGeometry( 200, 200, 200 ));
	}
}

export default Box;