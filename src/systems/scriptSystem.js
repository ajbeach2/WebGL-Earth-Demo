import ScriptComponent from '../components/scriptComponent';

class ScriptSystem{
  constructor(scene){
    this.scene = scene;
    this.scripts = {};
  }

  addScript(context,name,func){
    if(this.scripts[name] === undefined){
      this.scripts[name] = new ScriptComponent(context,name,func);
    }else{
      throw(`${name} script already exists!`)
    }
  }

  process(){
    for (let key in this.scripts){
      var script = this.scripts[key];
      script.run();
    }
  }
}
export default ScriptSystem;