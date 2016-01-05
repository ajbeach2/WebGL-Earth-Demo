import {GUI} from 'dat-gui';
import THREE from '../../lib/three';
import DatGuiHelper from '../../lib/datguihelper'



class GuiSystem {
  constructor(scene){

    this.scene = scene;
    this.gui = new GUI();
    this.directionalLight();
    this.material();
  }
 
  material(){
    var sphere = this.scene.getObjectsByName('SphereComponent')[0],
    material = sphere.material,
    geometry = sphere.geometry;

    DatGuiHelper.guiMeshPhongMaterial(this.gui, sphere, material,geometry);
  }

  directionalLight(){
    var light = this.scene.getObjectsByName('DirectionalLight')[0];
    var position = light.position;

    var Color = function() {
      this.hex = [1,1,1]; // CSS string
    };

    var lightFolder = this.gui.addFolder('Directional Light');
    lightFolder.add(position, 'x').min(-1.0).max(1.0).step(.1); 
    lightFolder.add(position, 'y').min(-1.0).max(1.0).step(.1); 
    lightFolder.add(position, 'z').min(-1.0).max(1.0).step(.1); 
    var color = new Color();
    var controller = lightFolder.addColor(color, 'hex');

      controller.onChange(function(value) {
        var normalized = value.map(function(x){return x/255.0});
        light.color.setRGB(normalized[0],normalized[1],normalized[2]);
      });
  }



}
export default GuiSystem;