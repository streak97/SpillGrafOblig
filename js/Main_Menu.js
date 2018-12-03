/** @author Jakob Overrein
 *
 * Displays and handles the menu screens
 */

class Main_Menu extends Engine {

    constructor(scene, renderer) {
        super(scene, renderer);

        this.objects = [];

        this.raycaster = null;
        this.active = false;
        this.info_scene = new THREE.Scene();
        this.end_scene = new THREE.Scene();
        this.saved_scene = scene;
    }

    start(ending){
        this.active = true;
        this.setupScene();

        this.setupInfoScene();
        if(ending === "winner" || ending === "loser"){
            this.setupEndScene(ending);
        }
        this.menuObjects();
        this.animate();
    }

    setupScene(){
        this.camera = new THREE.OrthographicCamera(-200, 200, 200, -200, 1, 500);

        this.camera.position.x = 0;
        this.camera.position.y = 200;
        this.camera.position.z = 10;

        this.camera.up = new THREE.Vector3(0, 1, 0);
        this.camera.lookAt(new THREE.Vector3(0, 200, 0));

        let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        directionalLight.position.set(new THREE.Vector3(50, 250, 20));
        directionalLight.target.position.set(new THREE.Vector3(0, 200, 0));
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        let ambientLight = new THREE.AmbientLight("#CCCCCC");
        this.scene.add(ambientLight);

        let backG = this.backgroundPlane();
        backG.translateY(200);
        this.scene.add(backG);

        window.addEventListener("resize", this.onWindowResize.bind(this), false);

        this.raycaster = new THREE.Raycaster();
        let INTERSECTED;

        document.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), true);
        document.addEventListener( "mousemove", this.onDocumentMouseMove.bind(this), false );

    }

    setupInfoScene(){
        this.info_scene = this.scene.clone();

        let infoboard = this.createOption("Here is some info");
        infoboard.translateY(250);
        this.info_scene.add(infoboard);

        let back_opt = this.createOption("Back");
        back_opt.translateY(150);
        this.info_scene.add(back_opt);
        this.objects.push(back_opt);
    }

    setupEndScene(ending){
        this.end_scene = this.scene.clone();

        let text = "Winner!!!!";
        if(ending === "loser"){
            text = "You lost"
        }

        let infoBoard = this.createOption(text);
        infoBoard.translateY(250);
        this.end_scene.add(infoBoard);

        let back_opt = this.createOption("Back");
        back_opt.translateY(150);
        this.end_scene.add(back_opt);
        this.objects.push(back_opt);

        this.saved_scene = this.scene;
        this.scene = this.end_scene;
    }

    menuObjects(){

        let listener = new THREE.AudioListener();
        this.camera.add(listener);

        let music = new THREE.Audio(listener);
        music.name = "music";
        this.scene.add(music);

        let mLoader = new THREE.AudioLoader();

        mLoader.load(
            "assets/music/bensound-epic.ogg",
            function(audioBuffer){
                music.setBuffer(audioBuffer);
                music.setLoop(true);
                music.play();
            },
            function ( xhr ) {
                console.log( "Music: " + (xhr.loaded / xhr.total * 100) + '% loaded' );
            }
        );

        let start_opt = this.createOption("Start");
        start_opt.translateY(300);
        this.scene.add(start_opt);
        this.objects.push(start_opt);

        let options_opt = this.createOption("Options");
        options_opt.translateY(200);
        this.scene.add(options_opt);
        this.objects.push(options_opt);

        let info_opt = this.createOption("Info");
        info_opt.translateY(100);
        this.scene.add(info_opt);
        this.objects.push(info_opt);
    }

    backgroundPlane() {
        let loader = new THREE.TextureLoader();
        let bckTxt = loader.load("textures/skybox1/back.png");
        let bkMat = new THREE.MeshPhongMaterial({map: bckTxt, side: THREE.DoubleSide});

        let planeGeo = new THREE.PlaneBufferGeometry(400, 400);

        let planeMesh = new THREE.Mesh(planeGeo, bkMat);
        planeMesh.name = "Background";
        planeMesh.receiveShadow = true;
        planeMesh.translateZ(-3);

        return planeMesh;
    }

    createOption(text){
        let loader = new THREE.TextureLoader();
        let signTxt = loader.load("textures/Bumpy_Yellow_Diffuse.jpg"); //http://www.bctv.kr/yabc/%EC%97%AC%EA%B8%B0%EC%A3%BC%EC%84%B8%EC%9A%94/%ED%94%84%EB%A6%AC%EB%AF%B8%EC%96%B4_%EC%97%90%ED%8E%99_%ED%94%8C%EB%9F%AC%EA%B7%B8%EC%9D%B8/TPL_Material-Pack-Element3D-V2/_Material-Pack/Metal/Bumpy_Yellow_Diffuse.jpg
        signTxt.wrapS = THREE.RepeatWrapping;
        signTxt.wrapT = THREE.RepeatWrapping;
        let signMat = new THREE.MeshPhongMaterial({map: signTxt, side: THREE.DoubleSide});

        let boxGeo = new THREE.BoxBufferGeometry(6, 5, 1);

        //Sign board
        let signMesh = new THREE.Mesh(boxGeo, signMat);
        signMesh.name = "sign:" + text;
        signMesh.castShadow = true;
        signMesh.receiveShadow = true;

        let mat = new THREE.MeshPhongMaterial({color: "#0000ff", side: THREE.DoubleSide});
        let fontLoader = new THREE.FontLoader();

        fontLoader.load("fonts/helvetiker_regular.typeface.json", function (font) {
            let text_attr = {
                font: font,
                size: 0.25,
                height: 0.5,
                curveSegments: 12,
            };
            let textGeo = new THREE.TextBufferGeometry(text, text_attr);


            let textMesh = new THREE.Mesh(textGeo, mat);
            textMesh.name = "text:" + text;
            textMesh.translateX(-2);
            textMesh.scale.x = 3;
            textMesh.scale.y = 3;
            textMesh.castShadow = true;
            textMesh.receiveShadow = true;

            signMesh.add(textMesh);

        });
        signMesh.scale.x = 10;
        signMesh.scale.y = 10;

        return signMesh
    }

    animate(){
        if(this.active === true){
            requestAnimationFrame(this.animate.bind(this));
        }

        this.render();
    }

    render(){
        this.raycaster.setFromCamera( this.mouse, this.camera );

        let intersects = this.raycaster.intersectObjects( this.objects);
        if ( intersects.length > 0 ) {
            if ( this.mouse.INTERSECTED !== intersects[0].object ) {
                if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
                this.INTERSECTED = intersects[ 0 ].object;
                this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
                this.INTERSECTED.material.emissive.setHex( 0x007700 );
            }
        } else {
            if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
            this.INTERSECTED = null;
        }

        super.render();
    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.render();
    }

    onDocumentMouseDown(e){
        e.preventDefault();

        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.objects);

        if (intersects.length > 0) {
            let opt = intersects[0].object.name.split(":")[1];
            switch (opt) {
                case "Start":
                    super.setState(this.STATE_GAME);
                    this.active = false;
                    this.scene.getObjectByName("music").stop();
                    console.log(opt);
                    this.removeListeners();
                    new Level(new THREE.Scene(), this.renderer).start(1);
                    break;
                case "Options":
                    console.log(opt);
                    break;
                case "Info":
                    this.saved_scene = scene;
                    this.scene.getObjectByName("music").stop();
                    this.scene = this.info_scene;
                    console.log(opt);
                    break;
                case "Back":
                    this.scene = this.saved_scene;
                    this.scene.getObjectByName("music").play();
                    console.log(opt);
                    break;
            }
        }
    }

    onDocumentMouseMove(e){
        e.preventDefault();
        this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    }

    removeListeners() {
        document.addEventListener('mousedown', function (event)  {
            event.stopPropagation();
        }, true);
    }
}