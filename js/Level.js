/**@author Alexander Erlingsen og Jakob Overrein
 *
 *  Sets up manages the logic og the playable level
 */
class Level extends Engine {
    //TODO: Collision detection(points)

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
            A: {code: 65, isPressed: false},
            D: {code: 68, isPressed: false},
            W: {code: 87, isPressed: false},
            S: {code: 83, isPressed: false},
            Space: {code: 32, isPressed: false},
            F: {code: 70, isPressed: false}
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
        // Variabler for fysikk og player control
        this._cannon = window.game.cannon();
        this._cannon.init(this);
        this._helpers = window.game.helpers;

        this.fire_frame = 1;
        this.fires = [];

        this.plat_pos = [];
    }

    start(level) {
        this.player = Player();
        this.player.level = this;
        this.player.size = 5;
        this.setUpScene();

        this.setupHUD();

        this.setUpSkybox(this.scene, this.renderer, this.camera, level);
        this.plat_pos = setPlatformPositions();
        this.addTerrain();
        this.setUpPlatforms();

        this.animate();
    }

    setUpScene() {
        // CAMERA
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.set(-30, 150, 150);
        this.camera.lookAt(0, 0, 0);

        this.player.create();

        let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        directionalLight.position.set(new THREE.Vector3(50, 250, 20));
        directionalLight.target.position.set(new THREE.Vector3(0, 200, 0));
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        let ambientLight = new THREE.AmbientLight("#CCCCCC");
        this.scene.add(ambientLight);

        this.scene.add(this.camera);

        window.addEventListener("resize", this.onWindowResize.bind(this), false);
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }

    setUpPlatforms() {
        for (let i = 0; i < this.plat_pos.length; i++) {

            let val = this.plat_pos[i];
            let cone = this.createCone(i, val.haz);

            cone.position.set(val.x*10, val.y*10, val.z*10);
            // cone.translateY(val.y*10);
            // cone.translateZ(val.z*10);

        }

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

        let physiMat = this._cannon.createPhysicsMaterial(new THREE.MeshLambertMaterial({map: texMap, side: THREE.DoubleSide}));

        this.terrainGeo.computeVertexNormals();
        this.terrainGeo.computeFaceNormals();

        let physMesh = new Physijs.HeightfieldMesh(this.terrainGeo, physiMat, 0, 511, 511);
        physMesh.translateY(-100);

        this.scene.add(physMesh);

        let texWat = new THREE.TextureLoader().load("textures/water_texture.jpg");
        texWat.wrapS = THREE.RepeatWrapping;
        texWat.wrapT = THREE.RepeatWrapping;
        texWat.repeat.x = 4;
        texWat.repeat.y = 8;

        let waterGeo = new THREE.PlaneGeometry(2048, 2048);
        waterGeo.rotateX(-Math.PI/2);

        let watPysMat = new Physijs.createMaterial(new THREE.MeshLambertMaterial({map: texWat, side: THREE.DoubleSide, opacity: 0.7}));
        let watPysMesh = new Physijs.PlaneMesh(waterGeo, watPysMat, 0);
        watPysMesh.translateY(-85);

        this.scene.add(watPysMesh);
        this.terranLoaded = true;
    }

    addTerrain() {
        getHeightData("textures/heightmap2.png", 512, 1024, this.terrainHeightLoaded.bind(this));
    }

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
        if(this.player.ended === true){
            new Main_Menu(new THREE.Scene(), this.renderer).start(this.player.endType);
            return;
        }
        if (this.keys.F.isPressed) {
            new Main_Menu(new THREE.Scene(), this.renderer).start();
            return;
        }

        requestAnimationFrame(this.animate.bind(this));

        if (this.terranLoaded) {
            this._cannon.updatePhysics();

            this.player.update();
            this.updateCamera();
            this.animateFire();
            this.updateHP();

            this.render();
        }
    }

    render() {
        super.render();
    }

    updateCamera() {
        this.player.cameraCoords = this._helpers.polarToCartesian(this.player.cameraOffsetH, this.player.rotationRadians.y);

        this.camera.position.x = this.player.mesh.position.x + this.player.cameraCoords.x;
        this.camera.position.y = this.player.mesh.position.y + this.player.cameraOffsetV;
        this.camera.position.z = this.player.mesh.position.z + this.player.cameraCoords.z;

        this.camera.lookAt(this.player.mesh.position);
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

        let platformGeo = new THREE.ConeBufferGeometry(5 * 10, 5 * 25, 5 * 12);

        let halfextents = this.createCannonHalfExtents(platformGeo);

        let platformMesh = new THREE.Mesh(platformGeo, matArr);
        let shape = new CANNON.Box(halfextents);

        let rigidBody = new CANNON.RigidBody(
            0,
            shape,
            this._cannon.createPhysicsMaterial(new CANNON.Material("solidMaterial"), 0, 0.1)
        );
        platformMesh.name = "cone:" + name;
        platformMesh.castShadow = true;
        platformMesh.receiveShadow = true;
        rigidBody.platType = "";

        if (hazard === true) {
            rigidBody.platType = "fire";
            platformMesh.add(this.addHazard(name));
        } else if(hazard === false){
            rigidBody.platType = "coin";
            platformMesh.add(this.addCoin(name));
        }
        let mesh = this._cannon.addVisual(rigidBody, null, platformMesh);
        rigidBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI);
        return rigidBody;

    }

    addCoin(name) {
        let texLoader = new THREE.TextureLoader();

        let spriteTex = texLoader.load("textures/coin_texture.png");
        let matSprite = new THREE.SpriteMaterial({map: spriteTex});

        let coin = new THREE.Sprite(matSprite);

        coin.name = "hazard:" + name;
        coin.scale.set(10, 10, 10);
        coin.position.set(0, -100, 0);
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
        haz.position.set(0, -100, 0);
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
    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.render();
    }

    // hentet fra biblitoeket levert av Matthias Schuetz
    createCannonHalfExtents(geometry) {
        // The final bounding box also exsists so get its dimensions
        geometry.computeBoundingBox();

        // Return a Cannon vector to define the halfExtents
        return new CANNON.Vec3(
            (geometry.boundingBox.max.x - geometry.boundingBox.min.x) * 0.5,
            (geometry.boundingBox.max.y - geometry.boundingBox.min.y) * 0.5,
            (geometry.boundingBox.max.z - geometry.boundingBox.min.z) * 0.5
        );
    }

    createCannonGeometry(geometry, scale) {
        // Preparre translation properties
        var translateX;
        var translateY;
        var translateZ;

        // Get the bounding box for the provided geometry
        geometry.computeBoundingBox();

        // Center the imported model so the axis-aligned bounding boxes (AABB) and bounding spheres are generated correctly by Cannon.js
        translateX = -((geometry.boundingBox.size().x / 2) + geometry.boundingBox.min.x);
        translateY = -((geometry.boundingBox.size().y / 2) + geometry.boundingBox.min.y);
        translateZ = -((geometry.boundingBox.size().z / 2) + geometry.boundingBox.min.z);

        // Apply various matrix transformations to translate, rotate and scale the imported model for the Cannon.js coordinate system
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(translateX, translateY, translateZ));
        geometry.applyMatrix(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2));
        geometry.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale));
    }
}