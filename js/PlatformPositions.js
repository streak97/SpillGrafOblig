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
            haz: null
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
    ];
}