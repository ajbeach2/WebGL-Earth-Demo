import THREE from 'three.js'

THREE.Object3D.prototype.getObjectsByProperty = function(name,value,toReturn) {
    if ( this[ name ] === value ){
      toReturn.push(this);
    }
    for ( var i = 0, l = this.children.length; i < l; i ++ ) {
      var child = this.children[ i ];
      child.getObjectsByProperty( name, value,toReturn);
    }
};

THREE.Object3D.prototype.getObjectsByName = function(name){
  var query = []
  this.getObjectsByProperty('name', name, query);
  return query;
}
export default THREE;