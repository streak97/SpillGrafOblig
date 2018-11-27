"use strict";
class Engine{

    constructor(scene, renderer){

        this.STATE_MENU = 1;
        this.STATE_GAME = 2;

        this.GAME_STATE = Engine.STATE_MENU;

        this.scene = scene;
        this.renderer = renderer;

        this.camera = null;
        this.mouse = new THREE.Vector3();
    }

    setState(state){
        this.GAME_STATE = state;
    }

    render(){
        this.renderer.render(this.scene, this.camera);
    }
}