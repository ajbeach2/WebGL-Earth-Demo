import ScriptRunner from '../../lib/script';

class ScriptSystem{
  constructor(){
    this.scriptRunner = new ScriptRunner();
  }

  addScript(entity,name,func){
    this.scriptRunner.addScript(entity,name,func);
  }

  process(){
    this.scriptRunner.runAll();
  }
}
export default ScriptSystem;