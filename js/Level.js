/**@author Alexander Erlingsen
 *
 *
 */
class Level extends Engine {

    constructor(scene, renderer) {
        super(scene, renderer);

        this.terrainGeo = null;

        this.clearThree(scene);
    }

    start(level) {
        this.setUpScene();
        this.setUpSkybox(this.scene, this.renderer, this.camera, level);
        this.addTerrain();
        this.scene.add(this.createCone());

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

    createCone(){
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
        platformMesh.rotation.x = Math.PI;
        platformMesh.castShadow = true;
        platformMesh.receiveShadow = true;

        return platformMesh;

    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.render();
    }
}