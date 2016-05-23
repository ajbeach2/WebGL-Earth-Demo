// http://threejs.org/docs/scenes/js/material.js
class DatGuiHelper {

  static handleColorChange ( color ) {

    return function ( value ){
      if (typeof value === "string") {
        value = value.replace('#', '0x');
      }
      color.setHex( value );
      };

  }


 static guiMeshPhongMaterial ( gui, mesh, material, geometry ) {

    var data = {
      color : material.color.getHex(),
      emissive : material.emissive.getHex(),
      specular : material.specular.getHex()
    };

    var folder = gui.addFolder('THREE.MeshPhongMaterial');

    folder.addColor( data, 'color' ).onChange( this.handleColorChange( material.color ) );
    folder.addColor( data, 'emissive' ).onChange( this.handleColorChange( material.emissive ) );
    folder.addColor( data, 'specular' ).onChange( this.handleColorChange( material.specular ) );

    folder.add( material, 'shininess', 15, 100);
    folder.add( material, 'wireframe' );
    folder.add( material, 'wireframeLinewidth', 0, 10 );
    folder.add( material, 'fog' );

  }
}

export default DatGuiHelper;