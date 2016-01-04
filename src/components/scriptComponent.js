import THREE from '../../lib/three.js';

class ScriptComponent {
    constructor(context,name,func){
     this.context = context;
     this.func = func;
     this.name = name;
    }

    run(){
      this.func.call(this.context);
    }
}

export default ScriptComponent;