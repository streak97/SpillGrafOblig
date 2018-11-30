/**
 * @author Jakob Overrein
 *
 * Intended for common functions, not majorly used
 */

"use strict";
class Engine{

    constructor(scene, renderer){

        this.STATE_MENU = 1;
        this.STATE_GAME = 2;

        this.GAME_STATE = this.STATE_MENU;

        this.scene = scene;
        this.renderer = renderer;

        this.camera = null;
        this.mouse = new THREE.Vector2();
    }

    setState(state){
        this.GAME_STATE = state;
    }

    render(){
        this.renderer.render(this.scene, this.camera);
    }
}