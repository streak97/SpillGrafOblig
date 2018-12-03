/**
 * @author Jakob Overrein
 *
 * Intended for common functions, not majorly used.
 *
 * Mainly HUD functions
 */

"use strict";
class Engine{

    constructor(scene, renderer){

        this.STATE_MENU = 1;
        this.STATE_GAME = 2;

        this.GAME_STATE = this.STATE_MENU;

        this.scene = scene;
        this.renderer = renderer;

        this.hp = 100;
        this.score = 0;

        this.camera = null;
        this.mouse = new THREE.Vector2();

        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

    }

    setupHUD(){
        let hpGeo = new THREE.PlaneBufferGeometry(10, 1);

        let matRed = new THREE.MeshBasicMaterial({color: 0xff0000});
        let matGreen = new THREE.MeshBasicMaterial({color: 0x00ff00});

        let redMesh = new THREE.Mesh(hpGeo, matRed);
        let greenMesh = new THREE.Mesh(hpGeo, matGreen);
        greenMesh.name = "HPbar";

        redMesh.position.set(0,-7, -10);
        this.camera.add(redMesh);
        greenMesh.position.set(0,-7, -10);
        this.camera.add(greenMesh);

        this.writeScore();
    }

    writeScore(){

        let cam = this.camera;
        let s = this.score;

        let mat = new THREE.MeshBasicMaterial({color: "#ffffff"});
        let fontLoader = new THREE.FontLoader();

        fontLoader.load("fonts/helvetiker_regular.typeface.json", function (font) {
            let text_attr = {
                font: font,
                size: 0.35,
                height: 0.5,
            };

            let textGeo = new THREE.TextBufferGeometry(s.toString(), text_attr);

            let textMesh = new THREE.Mesh(textGeo, mat);
            textMesh.name = "score";
            textMesh.scale.x = 3;
            textMesh.scale.y = 3;

            textMesh.position.set(0, 6, -10);
            cam.add(textMesh);

        });
    }

    updateHP(){
        let bar = this.camera.getObjectByName("HPbar");
        bar.scale.set(this.hp/100, 1, 1);
    }

    updateScore(){
        this.camera.remove(this.camera.getObjectByName("score"));
        this.writeScore();
    }

    setState(state){
        this.GAME_STATE = state;
    }

    render(){
        this.stats.update();
        this.renderer.render(this.scene, this.camera);
    }
}