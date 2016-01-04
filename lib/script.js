class Script {
    constructor(context,name,func){
     this.context = context;
     this.func = func;
     this.name = name;
    }

    run(){
      this.func.call(this.context);
    }
}

class ScriptRunner{
  constructor(){
    this.scripts = [];
  }

  addScript(context,name,func){
    this.scripts.push(new Script(context,name,func));
  }

  runAll(){
    for (let script of this.scripts){
      script.run();
    }
  }
}

export default ScriptRunner;