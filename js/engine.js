class engine{

    static STATE_MENU = 1;
    static STATE_GAME = 2;

    constructor(scene, renderer){
        this.GAME_STATE = engine.STATE_MENU;

        this.scene = scene;
        this.renderer = renderer;

        this.camera = null;
    }

    setState(state){
        this.GAME_STATE = state;
    }

    render(){
        this.renderer.render(this.scene, this.camera);
    }
}