/** @author Jakob Overrein
 *
 * Displays and handles the main menu
 */
"use strict";
class main_menu extends engine {

    constructor(scene, renderer) {
        super();
        this.scene = scene;
        this.renderer = renderer;

        this.objects = [];

        this.raycaster = null;
        this.mouse = null;
        this.active = false;
        this.camera = null;
    }

    start(){
        this.active = true;
        this.setupScene();

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
        directionalLight.position.set(new THREE.Vector3(0, 200, 10));
        directionalLight.target.position.set(new THREE.Vector3(0, 200, 0));
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        let ambientLight = new THREE.AmbientLight("#525252");
        this.scene.add(ambientLight);

        window.addEventListener("resize", this.onWindowResize, false);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(), INTERSECTED;

        document.addEventListener("mousedown", this.onDocumentMouseDown, false);
        document.addEventListener( "mousemove", this.onDocumentMouseMove, false );

    }

    menuObjects(){
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

    createOption(text){
        let loader = new THREE.TextureLoader();
        let signTxt = loader.load("textures/Bumpy_Yellow_Diffuse.jpg"); //http://www.bctv.kr/yabc/%EC%97%AC%EA%B8%B0%EC%A3%BC%EC%84%B8%EC%9A%94/%ED%94%84%EB%A6%AC%EB%AF%B8%EC%96%B4_%EC%97%90%ED%8E%99_%ED%94%8C%EB%9F%AC%EA%B7%B8%EC%9D%B8/TPL_Material-Pack-Element3D-V2/_Material-Pack/Metal/Bumpy_Yellow_Diffuse.jpg
        signTxt.wrapS = THREE.RepeatWrapping;
        signTxt.wrapT = THREE.RepeatWrapping;
        signTxt.repeat.set(6, 5);
        let signMat = new THREE.MeshPhongMaterial({map: signTxt, side: THREE.DoubleSide});

        let boxGeo = new THREE.BoxBufferGeometry(6, 5, 1);

        //Sign board
        let signMesh = new THREE.Mesh(boxGeo, signMat);
        signMesh.name = "sign:" + text;
        signMesh.castShadow = true;
        signMesh.receiveShadow = true;

        let mat = new THREE.MeshPhongMaterial({color: "#00cc00", side: THREE.DoubleSide});
        let fontLoader = new THREE.FontLoader();

        fontLoader.load("fonts/helvetiker_regular.typeface.json", function (font) {
            let text_attr = {
                font: font,
                size: 0.25,
                height: 0.5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.03,
                bevelSegments: 2
            };
            let textGeo = new THREE.TextBufferGeometry(text, text_attr);


            let textMesh = new THREE.Mesh(textGeo, mat);
            textMesh.name = "text:" + text;
            textMesh.translateX(-2.5);
            textMesh.translateY(1);
            textMesh.castShadow = true;
            textMesh.receiveShadow = true;

            signMesh.add(textMesh);

        });

        return signMesh
    }

    animate(){
        if(this.active){
            requestAnimationFrame(this.animate);
        }

        this.render();
    }

    render(){
        this.raycaster.setFromCamera( this.mouse, this.camera );

        let intersects = this.raycaster.intersectObjects( this.objects);
        if ( intersects.length > 0 ) {
            if ( this.INTERSECTED !== intersects[0].object ) {
                if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
                this.INTERSECTED = intersects[ 0 ].object;
                this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
                this.INTERSECTED.material.emissive.setHex( 0x007700 );
            }
        } else {
            if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
            this.INTERSECTED = null;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        //controls.handleResize();
        this.render();
    }

    onDocumentMouseDown(e){
        e.preventDefault();

        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.objects);

        if (intersects.length > 0) {
            let opt = intersects[0].object.name.split(":")[1];
            switch (opt) {
                case "Start": super.setState(engine.STATE_GAME);break;
                case "Options": super.setState(engine.STATE_GAME);break;
                case "Info": super.setState(engine.STATE_GAME);break;
            }
        }
    }

    onDocumentMouseMove(e){
        e.preventDefault();
        this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    }

}