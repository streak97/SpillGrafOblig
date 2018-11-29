/**@author Alexander Erlingsen
 *
 *
 */
class Level extends Engine {

    constructor(scene, renderer) {
        super(scene, renderer);

        this.terrainGeo = null;

        this.clearThree(scene);
        this.fire_frame = 1;
        this.fires = [];
    }

    start(level) {
        this.setUpScene();
        this.setUpSkybox(this.scene, this.renderer, this.camera, level);
        //this.addTerrain();
        this.scene.add(this.createCone("test", true));

        //animationtesting
        //setInterval(this.animateFire.bind(this), 100);
    }

    setUpScene() {
        // CAMERA
        this.camera = new THREE.PerspectiveCamera(85, 16/9, .025, 20000);
        this.camera.position.set(100, 100, 1);
        this.camera.lookAt(0, 0, 0);

        let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        directionalLight.position.set(new THREE.Vector3(50, 250, 20));
        directionalLight.target.position.set(new THREE.Vector3(0, 200, 0));
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        let ambientLight = new THREE.AmbientLight("#CCCCCC");
        this.scene.add(ambientLight);

        window.addEventListener("resize", this.onWindowResize.bind(this), false);
    }

    terrainHeightLoaded(data){
        this.terrainGeo = new THREE.PlaneBufferGeometry(500, 1000, 511, 1023);

        for (var i = 0, len = this.terrainGeo.vertices.length; i < len; i++) {
            terrainGeo.vertices[i].z = data[i] / 3;
        }

        let texMap = THREE.TextureLoader().load("textures/grass_texture.jpg");
        texMap.wrapS = THREE.RepeatWrapping;
        texMap.wrapT = THREE.RepeatWrapping;
        texMap.repeat.x = 4;
        texMap.repeat.y = 8;

        //TODO: Physijs material

        this.terrainGeo.computeVertexNormals();
        this.terrainGeo.computeFaceNormals();

        //TODO: Physijs mesh

        //TODO: Water plane

    }

    addTerrain(){
        getHeightData("textures/heightmap.png", 512, 1024, this.terrainHeightLoaded);
    }

    clearThree(obj){
        while(obj.children.length > 0){
            this.clearThree(obj.children[0]);
            obj.remove(obj.children[0]);
        }
        if(obj.geometry) obj.geometry.dispose();
        if(obj.material) obj.material.dispose();
        if(obj.texture) obj.texture.dispose();
    }

    setUpSkybox(scene, renderer, camera, skybox) {
        let skyDir = "./textures/skybox" + skybox + "/";

        // LOAD CUBE TEXTURE
        new THREE.CubeTextureLoader()
            .setPath(skyDir)
            .load(
                // urls of images used in the cube texture
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

                    renderer.render(scene, camera);

                });
    }

    createCone(name, hazard){
        let texLoader = new THREE.TextureLoader();
        let top = texLoader.load("textures/platform_top_texture.png");
        let sides = texLoader.load("textures/platform_side_texture.png");
        sides.center = new THREE.Vector2(0.5, 0.5);
        sides.rotation = Math.PI/2;

        let matArr = [
            new THREE.MeshPhongMaterial({map:sides, side: THREE.DoubleSide}),
            new THREE.MeshPhongMaterial({map:sides, side: THREE.DoubleSide}),
            new THREE.MeshPhongMaterial({map:top, side: THREE.DoubleSide}),
        ];

        let platformGeo = new THREE.ConeBufferGeometry(10, 25, 12);
        let platformMesh = new THREE.Mesh(platformGeo, matArr);
        platformMesh.name = "cone:" + name;
        platformMesh.rotation.x = Math.PI;
        platformMesh.castShadow = true;
        platformMesh.receiveShadow = true;

        if(hazard === true){
            platformMesh.add(this.addHazard(name));
        } else {
            platformMesh.add(this.addCoin(name));
        }

        return platformMesh;

    }

    addCoin(name){
        let texLoader = new THREE.TextureLoader();

        let spriteTex = texLoader.load("textures/coin_texture.png");
        let matSprite = new THREE.SpriteMaterial({map: spriteTex});

        let coin = new THREE.Sprite(matSprite);
        coin.name = "hazard:" + name;
        coin.scale.set(5, 5, 5);
        coin.position.set(5,-20,0);
        coin.updateMatrix();

        return coin;
    }

    addHazard(name){
        let texLoader = new THREE.TextureLoader();

        let spriteTex = texLoader.load("textures/fire_grid.png");

        spriteTex.wrapS = spriteTex.wrapT = THREE.RepeatWrapping;
        spriteTex.repeat = new THREE.Vector2(1/8, 1/4);
        spriteTex.name = "fire_texture";

        let matSprite = new THREE.SpriteMaterial({
            map: spriteTex,
        });

        let haz = new THREE.Sprite(matSprite);
        haz.name = "haz:" + name;
        haz.scale.set(20, 20, 20);
        haz.position.set(-5,-20,0);
        haz.updateMatrix();
        this.fires.push(spriteTex);

        return haz;
    }

    animateFire(){
        for (let i = 0; i < this.fires.length; i++) {
            this.fire_frame = (this.fire_frame + 1) % (4*8);
            let u = 1/8 * (this.fire_frame % 8);
            let v = 1/4 * Math.floor(this.fire_frame / 8);

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