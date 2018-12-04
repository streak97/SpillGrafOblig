/**
 * @author Jakob Overrein
 *
 * Coordinates and type of platforms to be placed in level
 * */

function setPlatformPositions(){
    return [
        {
            x: 0,
            y: 0,
            z: 0,
            haz: null //Start platform
        },
        {
            x: 20,
            y: 0,
            z: 1,
            haz: false
        },
        {
            x: 35,
            y: 4,
            z: -5,
            haz: true
        },
        {
            x: 35,
            y: 4,
            z: 5,
            haz: false
        },
        {
            x: -40,
            y: -10,
            z: 20,
            haz: false
        },
        {
            x: -60,
            y: 0,
            z: 40,
            haz: false
        },
        {
            x: 0,
            y: 10,
            z: 10,
            haz: false
        },
        {
            x: 10,
            y: 20,
            z: 0,
            haz: true
        },
        {
            x: 0,
            y: 0,
            z: -20,
            haz: true
        },
    ];
}