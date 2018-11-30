/**@author Alexander Erlingsen
 *
 *
 */
class Level extends Engine {

    constructor(scene, renderer) {
        Physijs.scripts.worker = './lib/physijs_worker.js';
        Physijs.scripts.ammo = './ammo.js';
        scene = new Physijs.Scene({fixedTimeStep: 1 / 8});
        super(scene, renderer);
        this.scene.setGravity(new THREE.Vector3(0, -10, 0));
        // Player
        this.player = null;
        this.terranLoaded = false;
        this.keys = {
            LEFT: {code: 37, isPressed: false},
            UP: {code: 38, isPressed: false},
            RIGHT: {code: 39, isPressed: false},
            A: {code: 65, isPressed: false},
            D: {code: 68, isPressed: false},
            W: {code: 87, isPressed: false}
        };

        this.raycaster = null;
        this.runSpeed = 7;
        this.walkSpeed = 3;
        this.clock = new THREE.Clock();
        this.canJump = false;
        this.objects = [];
        this.playerSpeed = 0;

        this.prevTime = performance.now();
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.vertex = new THREE.Vector3();
        this.color = new THREE.Color();
        this.terrainGeo = null;

        this.fire_frame = 1;
        this.fires = [];
    }

    start(level) {
        this.player = this.addPlayer();
        this.setUpScene();
        this.setUpSkybox(this.scene, this.renderer, this.camera, level);
        this.addTerrain();
        this.setUpPlatforms();

        //animationtesting
        //setInterval(this.animateFire.bind(this), 100);
        this.animate();
    }

    setUpScene() {
        // CAMERA
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.set(-30, 150, 150);
        this.camera.lookAt(0, 0, 0);

        this.controls = new THREE.OrbitControls(this.camera);
        this.controls.autoRotate = true;
        this.controls.target = this.player.position;

        this.player.position.set(0, 130, 0);

        let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        directionalLight.position.set(new THREE.Vector3(50, 250, 20));
        directionalLight.target.position.set(new THREE.Vector3(0, 200, 0));
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        this.scene.add(this.player);
        let ambientLight = new THREE.AmbientLight("#CCCCCC");
        this.scene.add(ambientLight);
        this.scene.add(this.camera);
        window.addEventListener("resize", this.onWindowResize.bind(this), false);
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }

    setUpPlatforms() {
        let cone1 = this.createCone("test", true);

        cone1.translateY(5);
        this.scene.add(cone1);
        this.objects.push(cone1);

    }

    onKeyDown(event) {
        for (let k in this.keys) {

            if (event.keyCode === this.keys[k].code) {

                this.keys[k].isPressed = true;
            }

        }
    }

    onKeyUp(event) {
        for (let k in this.keys) {

            if (event.keyCode === this.keys[k].code) {

                this.keys[k].isPressed = false;
            }

        }
    }

    addPlayer() {
        let playerGeo = new THREE.BoxBufferGeometry(5, 5, 5);
        let playerMat = new Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 0xBBBBBB}));
        let playerMesh = new Physijs.BoxMesh(playerGeo, playerMat, 100);
        return playerMesh;
    }

    terrainHeightLoaded(data) {
        this.terrainGeo = new THREE.PlaneGeometry(2048, 2048, 511, 511);

        for (var i = 0, len = this.terrainGeo.vertices.length; i < len; i++) {
            this.terrainGeo.vertices[i].z = data[i] / 3;
        }

        let texMap = new THREE.TextureLoader().load("textures/grass_texture.jpg");
        texMap.wrapS = THREE.RepeatWrapping;
        texMap.wrapT = THREE.RepeatWrapping;
        texMap.repeat.x = 4;
        texMap.repeat.y = 8;

        this.terrainGeo.rotateX(-Math.PI / 2);

        //TODO: Physijs material
        let physiMat = new Physijs.createMaterial(new THREE.MeshLambertMaterial({map: texMap, side: THREE.DoubleSide}));

        this.terrainGeo.computeVertexNormals();
        this.terrainGeo.computeFaceNormals();

        //TODO: Physijs mesh
        let physMesh = new Physijs.HeightfieldMesh(this.terrainGeo, physiMat, 0, 511, 511);


        this.scene.add(physMesh);
        this.terranLoaded = true;
        //TODO: Water plane

    }

    addTerrain() {
        getHeightData("textures/heightmap2.png", 512, 1024, this.terrainHeightLoaded.bind(this));
    }

    // clearThree(obj){
    //     while(obj.children.length > 0){
    //         this.clearThree(obj.children[0]);
    //         obj.remove(obj.children[0]);
    //     }
    //     if(obj.geometry) obj.geometry.dispose();
    //     if(obj.material) obj.material.dispose();
    //     if(obj.texture) obj.texture.dispose();
    // }

    setUpSkybox(scene, renderer, camera, skybox) {
        let skyDir = "./textures/skybox" + skybox + "/";

        // LOAD CUBE TEXTURE
        new THREE.CubeTextureLoader()
            .setPath(skyDir)
            .load(
                [
                    'left.png',
                    'right.png',
                    'up.png',
                    'down.png',
                    'front.png',
                    'back.png'
                ],

                // what to do when loading is over
                function (cubeTexture) {

                    // CUBE TEXTURE is also an option for a background
                    scene.background = cubeTexture;

                });
    }


    animate(elapsed) {
        requestAnimationFrame(this.animate.bind(this));
        if (this.terranLoaded) {

            this.animateFire();

            this.updatePlayerPos(this.clock.getDelta()/10);
            this.updateCamera();


            this.scene.simulate();
            this.render();
        }
    }

    updateCamera() {
        this.controls.target.copy(this.player.position);
        // this.controls.target.y += this.player.geometry.boundingSphere.radius * 2;
        this.controls.update();

        let camOffset = this.camera.position.clone().sub(this.controls.target);
        camOffset.normalize().multiplyScalar(100);
        let pos = this.controls.target.clone().add(camOffset);
        this.camera.position.set(pos.x, pos.y, pos.z);
    }

    updatePlayerPos(delta) {
        let newSpeed = this.playerSpeed;

        if (this.keys.UP.isPressed || this.keys.W.isPressed) {
            newSpeed += delta;
            this.player.__dirtyPosition = true;
            this.player.__dirtyRotation = true;
        } else
            newSpeed -= delta;

        newSpeed = Math.min(1, Math.max(newSpeed, 0));

        if (this.keys.LEFT.isPressed || this.keys.A.isPressed) {
            this.player.rotation.y += delta * 2;
            this.player.__dirtyRotation = true;
            this.player.__dirtyPosition = true;
        } else if (this.keys.RIGHT.isPressed || this.keys.D.isPressed) {
            this.player.rotation.y -= delta * 2;
            this.player.__dirtyPosition = true;
            this.player.__dirtyRotation = true;
        }

        let forward = new THREE.Vector3(-this.player.matrixWorld.elements[8],
            -this.player.matrixWorld.elements[9],
            -this.player.matrixWorld.elements[10]);
        let finalSpeed = (newSpeed > 0.5) ? newSpeed * this.runSpeed : (newSpeed / 0.5) * this.walkSpeed;


        this.playerSpeed = newSpeed;
        this.player.position.add(forward.multiplyScalar(finalSpeed));


        console.log("Player position is " + this.player.position.x + " : " + this.player.position.z)
    }

    render() {
        super.render();
    }

    createCone(name, hazard) {
        let texLoader = new THREE.TextureLoader();
        let top = texLoader.load("textures/platform_top_texture.png");
        let sides = texLoader.load("textures/platform_side_texture.png");
        sides.center = new THREE.Vector2(0.5, 0.5);
        sides.rotation = Math.PI / 2;

        let matArr = [
            new THREE.MeshLambertMaterial({map: sides, side: THREE.DoubleSide}),
            new THREE.MeshLambertMaterial({map: sides, side: THREE.DoubleSide}),
            new THREE.MeshLambertMaterial({map: top, side: THREE.DoubleSide}),
        ];

        let physiMat = new Physijs.createMaterial(new THREE.MeshBasicMaterial());
        physiMat.visible = false;
        let platformGeo = new THREE.ConeBufferGeometry(5 * 10, 5 * 25, 5 * 12);
        let physiMesh = new Physijs.ConeMesh(platformGeo, physiMat, 0);
        physiMat.visible = false;
        let platformMesh = new THREE.Mesh(platformGeo, matArr);
        platformMesh.rotation.x = Math.PI;
        physiMesh.add(platformMesh);
        platformMesh.position.y = -1.0;
        platformMesh.name = "cone:" + name;
        platformMesh.castShadow = true;
        platformMesh.receiveShadow = true;

        if (hazard === true) {
            platformMesh.add(this.addHazard(name));
        } else {
            platformMesh.add(this.addCoin(name));
        }

        return physiMesh;

    }

    addCoin(name) {
        let texLoader = new THREE.TextureLoader();

        let spriteTex = texLoader.load("textures/coin_texture.png");
        let matSprite = new THREE.SpriteMaterial({map: spriteTex});

        let coin = new THREE.Sprite(matSprite);
        coin.name = "hazard:" + name;
        coin.scale.set(5, 5, 5);
        coin.position.set(5, -20, 0);
        coin.updateMatrix();

        return coin;
    }

    addHazard(name) {
        let texLoader = new THREE.TextureLoader();

        let spriteTex = texLoader.load("textures/fire_grid.png");

        spriteTex.wrapS = spriteTex.wrapT = THREE.RepeatWrapping;
        spriteTex.repeat = new THREE.Vector2(1 / 8, 1 / 4);
        spriteTex.name = "fire_texture";

        let matSprite = new THREE.SpriteMaterial({
            map: spriteTex,
        });

        let haz = new THREE.Sprite(matSprite);
        haz.name = "haz:" + name;
        haz.scale.set(50, 50, 50);
        haz.position.set(-25, -100, 0);
        haz.updateMatrix();
        this.fires.push(spriteTex);

        return haz;
    }

    animateFire() {
        for (let i = 0; i < this.fires.length; i++) {
            this.fire_frame = (this.fire_frame + 1) % (4 * 8);
            let u = 1 / 8 * (this.fire_frame % 8);
            let v = 1 / 4 * Math.floor(this.fire_frame / 8);

            let haz = this.fires[i];

            haz.offset.x = u;
            haz.offset.y = v;
            haz.needsUpdate = true;
        }
        this.render();
    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.render();
    }


}