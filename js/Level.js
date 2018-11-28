/**@author Alexander Erlingsen
 *
 *
 */
class Level extends Engine {

    constructor(scene, renderer) {
        super(scene, renderer);
    }

    start(level) {
        this.setUpSkybox(this.scene, this.renderer, level);
    }

    setUpSkybox(scene, renderer, skybox) {
        let skyDir = "./textures/skybox" + skybox + "/";

        // CAMERA
        let camera = new THREE.PerspectiveCamera(85, 16/9, .025, 20000);
        camera.position.set(1, 1, 1);
        camera.lookAt(0, 0, 0);

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
}