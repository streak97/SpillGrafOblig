/** @author Jakob Overrein
 *
 * Displays and handles the menu screens
 */

class Main_Menu extends Engine {

    constructor() {
        super();

        this.objects = [];

        this.raycaster = null;
        this.active = false;
        this.info_scene = new THREE.Scene();
        this.end_scene = new THREE.Scene();
        this.saved_scene = this.scene;
    }

    // Starts level
    start(ending){
        this.active = true;
        this.setupScene();

        this.setupInfoScene();
        this.setupEndScene(ending);
        this.menuObjects();
        console.log(ending);
        if(ending === "winner" || ending === "loser"){
            console.log("trigg");
            this.saved_scene = this.scene;
            this.scene = this.end_scene;
        }
        this.animate();
    }

    //Sets up scene elements
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

        document.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), false);
        document.addEventListener( "mousemove", this.onDocumentMouseMove.bind(this), false );

    }

    //Adds a scene element for information screen
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

    //Creates a scene for the ending
    setupEndScene(ending){
        this.end_scene = this.scene.clone();

        let text = "Winner!!!!";
        if(ending === "loser"){
            text = "You lost"
        }

        let infoBoard = this.createOption(text);
        infoBoard.translateY(250);
        this.end_scene.add(infoBoard);

        let back_opt = this.createOption("Return");
        back_opt.translateY(150);
        this.end_scene.add(back_opt);
        this.objects.push(back_opt);
    }

    //Creates selectable boxes in main menu
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

    //Adds background image
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

    //Creates a mesh for text boxes
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
            textMesh.translateZ(2);
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

    //animation for buttons
    animate(){
        if(this.active === true){
            requestAnimationFrame(this.animate.bind(this));
        }

        this.render();
    }

    //Renders scene and detects mouse over buttons
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

    //Handles window resize
    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.render();
    }

    //Detects button clicks
    onDocumentMouseDown(e){
        e.preventDefault();

        if (!(this.objects === null)) {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            let intersects = this.raycaster.intersectObjects(this.objects);

            if (intersects.length > 0) {
                let opt = intersects[0].object.name.split(":")[1];
                switch (opt) {
                    case "Start":
                        this.active = false;
                        this.scene.getObjectByName("music").stop();
                        console.log(opt);
                        this.clearThree(this.scene);
                        new Level().start(1);
                        break;
                    case "Options":
                        console.log(opt);
                        break;
                    case "Info":
                        this.saved_scene = this.scene;
                        this.scene.getObjectByName("music").stop();
                        this.scene = this.info_scene;
                        console.log(opt);
                        break;
                    case "Back":
                        this.scene = this.saved_scene;
                        this.scene.getObjectByName("music").play();
                        console.log(opt);
                        break;
                    case "Return":
                        // Hindre memory leak
                        location.reload();
                }
            }
        }
    }

    //Updates mouse position
    onDocumentMouseMove(e){
        e.preventDefault();
        this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    }

    //Clears objects
    clearThree(obj) {
        this.objects = [];
        super.clearThree(obj);

    }
}