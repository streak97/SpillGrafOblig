/**@author Alexander Erlingsen
 *
 *
 */
class Level extends Engine {

    constructor(scene, renderer) {
        super(scene, renderer);

        // Player
        this.player = null;

        this.raycaster = null;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.objects = [];
        this.moveSpeed = 5;

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
        this.setUpScene();
        this.setUpPlayer();
        this.setUpSkybox(this.scene, this.renderer, this.camera, level);
        //this.addTerrain();
        this.setUpPlatforms();

        //animationtesting
        //setInterval(this.animateFire.bind(this), 100);
        this.animate();
    }

    setUpScene() {
        // CAMERA
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.set(1, 20, 1);
        this.camera.lookAt(0, 0, 0);

        this.controls = new THREE.PointerLockControls(this.camera);
        this.controls.lock();

        let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        directionalLight.position.set(new THREE.Vector3(50, 250, 20));
        directionalLight.target.position.set(new THREE.Vector3(0, 200, 0));
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        let ambientLight = new THREE.AmbientLight("#CCCCCC");
        this.scene.add(ambientLight);
        this.controls.getObject().position.y = 300;
        this.scene.add(this.controls.getObject());
        window.addEventListener("resize", this.onWindowResize.bind(this), false);
        document.addEventListener( 'keydown', this.onKeyDown.bind(this), false );
        document.addEventListener( 'keyup', this.onKeyUp.bind(this), false );
        document.addEventListener('click', function () {
            this.controls.lock();
        }.bind(this), false);


        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10);
    }

    setUpPlatforms() {
        // floor

        var floorGeometry = new THREE.PlaneBufferGeometry( 2000, 2000, 100, 100 );
        floorGeometry.rotateX( - Math.PI / 2 );

        // vertex displacement

        var position = floorGeometry.attributes.position;

        for ( var i = 0, l = position.count; i < l; i ++ ) {

            this.vertex.fromBufferAttribute( position, i );

            this.vertex.x += Math.random() * 20 - 10;
            this.vertex.y += Math.random() * 2;
            this.vertex.z += Math.random() * 20 - 10;

            position.setXYZ( i, this.vertex.x, this.vertex.y, this.vertex.z );

        }

        floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

        position = floorGeometry.attributes.position;
        var colors = [];

        for ( var i = 0, l = position.count; i < l; i ++ ) {

            this.color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
            colors.push( this.color.r, this.color.g, this.color.b );

        }

        floorGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

        var floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

        var physMaterial = new Physijs.createMaterial(floorMaterial);
        physMaterial.visible = false;
        var physObj = new Physijs.CapsuleMesh(floorGeometry, physMaterial, 0);

        var floor = new THREE.Mesh( floorGeometry, floorMaterial );
        physObj.add(floor);
        floor.position.y = -1.0;

        let cone1 = this.createCone("test", true);

        cone1.scale.set(5,5,5);
        cone1.translateY(5);
        this.scene.add(cone1);
        this.scene.add( physObj );
        this.objects.push( physObj );
        this.objects.push(cone1);
    }

    onKeyDown( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                this.moveForward = true;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                this.moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = true;
                break;
            case 32: // space
                if ( this.canJump === true ) this.velocity.y += 350;
                this.canJump = false;
                break;
            case 16: // shift
                this.moveSpeed = 1;
                break;
        }
    }

    onKeyUp( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                this.moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = false;
                break;
            case 16: // shift
                this.moveSpeed = 5;
                break;
            case 32:
                this.canJump = true;
        }
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
        this.scene.simulate();
        requestAnimationFrame(this.animate.bind(this));

        if ( this.controls.isLocked === true ) {
            this.raycaster.ray.origin.copy( this.controls.getObject().position );
            this.raycaster.ray.origin.y -= 10;
            var intersections = this.raycaster.intersectObjects( this.objects );
            var onObject = intersections.length > 0;
            var time = performance.now();
            var delta = ( time - this.prevTime ) / 1000;
            this.velocity.x -= this.velocity.x * this.moveSpeed * delta;
            this.velocity.z -= this.velocity.z * this.moveSpeed * delta;
            this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
            this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
            this.direction.x = Number( this.moveLeft ) - Number( this.moveRight );
            this.direction.normalize(); // this ensures consistent movements in all directions
            if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * 400.0 * delta;
            if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * 400.0 * delta;
            if ( onObject === true ) {
                this.velocity.y = Math.max( 0, this.velocity.y );
            }
            this.controls.getObject().translateX( this.velocity.x * delta );
            this.controls.getObject().translateY( this.velocity.y * delta );
            this.controls.getObject().translateZ( this.velocity.z * delta );
            // if ( this.controls.getObject().position.y < 10 ) {
            //     this.velocity.y = 0;
            //     this.controls.getObject().position.y = 10;
            //     this.canJump = true;
            // }
            this.prevTime = time;
        }
        this.animateFire();

        this.render();
    }

    render() {
        super.render();
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

    setUpPlayer() {

    }
}