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
      // envMaps : envMapKeys,
      // map : textureMapKeys,
      // lightMap : textureMapKeys,
      // specularMap : textureMapKeys,
      // alphaMap : textureMapKeys
    };

    var folder = gui.addFolder('THREE.MeshPhongMaterial');

    folder.addColor( data, 'color' ).onChange( this.handleColorChange( material.color ) );
    folder.addColor( data, 'emissive' ).onChange( this.handleColorChange( material.emissive ) );
    folder.addColor( data, 'specular' ).onChange( this.handleColorChange( material.specular ) );

    folder.add( material, 'shininess', 0, 100);
    // folder.add( material, 'shading', constants.shading).onChange( needsUpdate( material, geometry ) );
    folder.add( material, 'wireframe' );
    folder.add( material, 'wireframeLinewidth', 0, 10 );
    // folder.add( material, 'vertexColors', constants.colors);
    folder.add( material, 'fog' );
    // folder.add( data, 'envMaps', envMapKeys ).onChange( updateTexture( material, 'envMap', envMaps ) );
    // folder.add( data, 'map', textureMapKeys ).onChange( updateTexture( material, 'map', textureMaps ) );
    // folder.add( data, 'lightMap', textureMapKeys ).onChange( updateTexture( material, 'lightMap', textureMaps ) );
    // folder.add( data, 'specularMap', textureMapKeys ).onChange( updateTexture( material, 'specularMap', textureMaps ) );
    // folder.add( data, 'alphaMap', textureMapKeys ).onChange( updateTexture( material, 'alphaMap', textureMaps ) );


  }
}

export default DatGuiHelper;