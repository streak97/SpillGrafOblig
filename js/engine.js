class engine{

    static STATE_MENU = 1;
    static STATE_GAME = 2;

    constructor(){
        this.GAME_STATE = engine.STATE_MENU;
    }

    setState(state){
        this.GAME_STATE = state;
    }
}