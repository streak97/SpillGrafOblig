Player = function () {

    let player =
        {
            // Attributes
            level: {},
            // Player entity including mesh and rigid body
            model:
                {},
            mesh:
                {},
            shape:
                {},
            rigidBody:
                {},
            // Player mass which affects other rigid bodies in the world
            mass:
                75,
            size:
                0,
            ended:
                false,
            endType:
                "looser",

            // HingeConstraint to limit player's air-twisting
            orientationConstraint:
                {},

            // Jump flags
            isGrounded:
                false,
            jumpHeight:
                38,

            // Configuration for player speed (acceleration and maximum speed)
            speed:
                1.5,
            speedMax:
                45,
            // Configuration for player rotation (rotation acceleration and maximum rotation speed)
            rotationSpeed:
                0.007,
            rotationSpeedMax:
                0.04,
            // Rotation values
            rotationRadians:
                new THREE.Vector3(0, 0, 0),
            rotationAngleX:
                {},
            rotationAngleZ:
                {},
            // Damping which means deceleration	(values between 0.8 and 0.98 are recommended)
            damping:
                0.98,
            // Damping or easing for player rotation
            rotationDamping:
                0.8,
            // Acceleration values
            acceleration:
                0,
            rotationAcceleration:
                0,
            // Enum for an easier method access to acceleration/rotation
            playerAccelerationValues:
                {
                    position: {
                        acceleration: "acceleration",
                        speed:
                            "speed",
                        speedMax:
                            "speedMax"
                    }
                    ,
                    rotation: {
                        acceleration: "rotationAcceleration",
                        speed:
                            "rotationSpeed",
                        speedMax:
                            "rotationSpeedMax"
                    }
                }
            ,

            // Third-person camera configuration
            playerCoords: {},
            cameraCoords:
                {},
            // Camera offsets behind the player (horizontally and vertically)
            cameraOffsetH:
                240,
            cameraOffsetV:
                140,

            // Keyboard configuration for game.events.js (controlKeys must be associated to game.events.keyboard.keyCodes)
            controlKeys:
                {
                    forward: "W",
                    backward:
                        "S",
                    left:
                        "A",
                    right:
                        "D",
                    jump:
                        "Space"
                }
            ,
            create: function () {
                // Globalt physic materiale som blit brukt som kontakt materiale
                player.level._cannon.playerPhysicsMaterial = new CANNON.Material("playerMaterial");

                // setter opp karakter model
                player.model.mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(player.size, player.size * 5, player.size * 5), new THREE.MeshLambertMaterial({color: 0x38FDD9}));
                player.model.halfExtents = player.level.createCannonHalfExtents((new THREE.SphereBufferGeometry(player.size, player.size * 5, player.size * 5)));

                // setter opp form på karakter
                player.shape = new CANNON.Box(player.model.halfExtents);
                player.rigidBody = new CANNON.RigidBody(player.mass, player.shape, player.level._cannon.createPhysicsMaterial(player.level._cannon.playerPhysicsMaterial));
                player.rigidBody.position.set(0, 300, 0);
                player.mesh = player.level._cannon.addVisual(player.rigidBody, null, player.model.mesh);

                // for å hindre karakter å vri seg så my i luften... er sagt å trenge litt arbeid
                player.orientationConstraint = new CANNON.HingeConstraint(player.rigidBody, new CANNON.Vec3(0, 0, 0), new CANNON.Vec3(0, 1, 0),
                    player.rigidBody, new CANNON.Vec3(0, 1, 0), new CANNON.Vec3(0, 1, 0));
                player.level._cannon.world.addConstraint(player.orientationConstraint);

                player.rigidBody.postStep = function () {
                    // resetter karakteren angulære hastighet for å begrense for mye rotasjon
                    player.rigidBody.angularVelocity.y = 0;

                    player.updateOrientation();
                };

                player.rigidBody.addEventListener("collide", function (e) {
                    // sjekker om spiller er på bakken
                    if (!player.isGrounded) {
                        // Sjekke om spiller er borti noe under ham med raycasting
                        player.isGrounded = (new CANNON.Ray(player.mesh.position, new CANNON.Vec3(0, -1, 0)).intersectBody(e.contact.bi).length > 0);
                    }
                });
            }
            ,
            update: function () {
                // oppdatere spiller og posisjon
                player.processUserInput();
                player.accelerate();
                player.rotate();
                player.event();

                // Level logikk
                player.checkGameOver();
            }
            ,
            updateAcceleration: function (values, direction) {
                if (direction === 1) {
                    // frem og høyre
                    if (player[values.acceleration] > -player[values.speedMax]) {
                        if (player[values.acceleration] >= player[values.speedMax] / 2) {
                            player[values.acceleration] = -(player[values.speedMax] / 4);
                        } else {
                            player[values.acceleration] -= player[values.speed];
                        }
                    } else {
                        player[values.acceleration] = -player[values.speedMax];
                    }
                } else {
                    // bak og venstre
                    if (player[values.acceleration] < player[values.speedMax]) {
                        if (player[values.acceleration] <= -(player[values.speedMax] / 2)) {
                            player[values.acceleration] = player[values.speedMax] / 4;
                        } else {
                            player[values.acceleration] += player[values.speed];
                        }
                    } else {
                        player[values.acceleration] = player[values.speedMax];
                    }
                }
            }
            ,
            processUserInput: function () {
                // Hopp
                if (player.level.keys[player.controlKeys.jump].isPressed) {
                    player.jump();
                }
                // Bevegelse: frem, bak, venstre, høyre
                if (player.level.keys[player.controlKeys.forward].isPressed) {
                    player.updateAcceleration(player.playerAccelerationValues.position, 1);
                    // resett orientering i luften
                    if (!player.level._cannon.getCollisions(player.rigidBody.index)) {
                        player.rigidBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), player.rotationRadians.y);
                    }
                }

                if (player.level.keys[player.controlKeys.backward].isPressed) {
                    player.updateAcceleration(player.playerAccelerationValues.position, -1);
                }

                if (player.level.keys[player.controlKeys.right].isPressed) {
                    player.updateAcceleration(player.playerAccelerationValues.rotation, -1);
                }

                if (player.level.keys[player.controlKeys.left].isPressed) {
                    player.updateAcceleration(player.playerAccelerationValues.rotation, 1);
                }
            }
            ,
            accelerate: function () {
                // kalkulerer spiller posisjon basert på nåværende akselerasjon Euler radianer fra spillers forige rotasjon
                player.playerCoords = player.level._helpers.polarToCartesian(player.acceleration, player.rotationRadians.y);

                // set XYZ verdiene
                player.rigidBody.velocity.set(player.playerCoords.x, player.rigidBody.velocity.y, player.playerCoords.z);

                // Damping
                if (!player.level.keys[player.controlKeys.forward].isPressed && !player.level.keys[player.controlKeys.backward].isPressed) {
                    player.acceleration *= player.damping;
                }
            }
            ,
            rotate: function () {
                // Roter spiller rundt y aksen
                player.level._cannon.rotateOnAxis(player.rigidBody, new CANNON.Vec3(0, 1, 0), player.rotationAcceleration);

                // damping
                if (!player.level.keys[player.controlKeys.left].isPressed && !player.level.keys[player.controlKeys.right].isPressed) {
                    player.rotationAcceleration *= player.rotationDamping;
                }
            }
            ,
            jump: function () {
                // utfør et hopp
                if (player.level._cannon.getCollisions(player.rigidBody.index) && player.isGrounded) {
                    player.isGrounded = false;
                    player.rigidBody.velocity.y = player.jumpHeight;
                }
            },
            event: function (){
                // Sjekker platformer for hendelser
                if (player.level._cannon.getCollisions(player.rigidBody.index) && player.isGrounded){

                    let cIndex = player.level._cannon.getCollided(0);

                    if(player.level._cannon.bodies[cIndex].platType === "fire"){
                        player.level.hp -= 40;

                        player.level._cannon.visuals[cIndex].remove(player.level._cannon.visuals[cIndex].children[0]);

                        player.level._cannon.bodies[cIndex].platType = "";

                        if(player.level.hp <= 0){
                            player.level._cannon.removeAllVisuals();
                            player.ended = true;
                        }
                    }
                    if(player.level._cannon.bodies[cIndex].platType === "coin"){
                        player.level.score += 1;
                        player.level.updateScore();

                        player.level._cannon.visuals[cIndex].remove(player.level._cannon.visuals[cIndex].children[0]);

                        player.level._cannon.bodies[cIndex].platType = "";

                        if(player.level.score > player.level.max_score - 1){
                            player.ended = true;
                            player.endType = "winner";
                        }
                    }
                }
            }
            ,
            updateOrientation: function () {
                // Konverterer spillers quaternion til euler radianer og lagrer dem i spiller rotationRadians
                player.rotationRadians = new THREE.Euler();
                setFromQuaternion(player.rotationRadians, player.rigidBody.quaternion, "ZXY");

                // Avrunde vinkler
                player.rotationAngleX = Math.round(player.level._helpers.radToDeg(player.rotationRadians.x));
                player.rotationAngleZ = Math.round(player.level._helpers.radToDeg(player.rotationRadians.z));


            }
            ,
            checkGameOver: function () {
                // Avslutter spillet om spiller har falt ned fra platform
                if (player.mesh.position.y <= -80) {
                    player.level._cannon.removeAllVisuals();
                    player.ended = true;
                }
            }
        };
    return player;
};

setFromQuaternion = function ( euler,q, order, update ) {

    // q is assumed to be normalized

    // clamp, to handle numerical problems

    function clamp( x ) {

        return Math.min( Math.max( x, -1 ), 1 );

    }

    // http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m

    var sqx = q.x * q.x;
    var sqy = q.y * q.y;
    var sqz = q.z * q.z;
    var sqw = q.w * q.w;

    order = order || "XYZ";

    if ( order === 'XYZ' ) {

        euler._x = Math.atan2( 2 * ( q.x * q.w - q.y * q.z ), ( sqw - sqx - sqy + sqz ) );
        euler._y = Math.asin(  clamp( 2 * ( q.x * q.z + q.y * q.w ) ) );
        euler._z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( sqw + sqx - sqy - sqz ) );

    } else if ( order ===  'YXZ' ) {

        euler._x = Math.asin(  clamp( 2 * ( q.x * q.w - q.y * q.z ) ) );
        euler._y = Math.atan2( 2 * ( q.x * q.z + q.y * q.w ), ( sqw - sqx - sqy + sqz ) );
        euler._z = Math.atan2( 2 * ( q.x * q.y + q.z * q.w ), ( sqw - sqx + sqy - sqz ) );

    } else if ( order === 'ZXY' ) {

        euler._x = Math.asin(  clamp( 2 * ( q.x * q.w + q.y * q.z ) ) );
        euler._y = Math.atan2( 2 * ( q.y * q.w - q.z * q.x ), ( sqw - sqx - sqy + sqz ) );
        euler._z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( sqw - sqx + sqy - sqz ) );

    } else if ( order === 'ZYX' ) {

        euler._x = Math.atan2( 2 * ( q.x * q.w + q.z * q.y ), ( sqw - sqx - sqy + sqz ) );
        euler._y = Math.asin(  clamp( 2 * ( q.y * q.w - q.x * q.z ) ) );
        euler._z = Math.atan2( 2 * ( q.x * q.y + q.z * q.w ), ( sqw + sqx - sqy - sqz ) );

    } else if ( order === 'YZX' ) {

        euler._x = Math.atan2( 2 * ( q.x * q.w - q.z * q.y ), ( sqw - sqx + sqy - sqz ) );
        euler._y = Math.atan2( 2 * ( q.y * q.w - q.x * q.z ), ( sqw + sqx - sqy - sqz ) );
        euler._z = Math.asin(  clamp( 2 * ( q.x * q.y + q.z * q.w ) ) );

    } else if ( order === 'XZY' ) {

        euler._x = Math.atan2( 2 * ( q.x * q.w + q.y * q.z ), ( sqw - sqx + sqy - sqz ) );
        euler._y = Math.atan2( 2 * ( q.x * q.z + q.y * q.w ), ( sqw + sqx - sqy - sqz ) );
        euler._z = Math.asin(  clamp( 2 * ( q.z * q.w - q.x * q.y ) ) );

    } else {

        console.warn( 'WARNING: Euler.setFromQuaternion() given unsupported order: ' + order )

    }




    return euler;

};