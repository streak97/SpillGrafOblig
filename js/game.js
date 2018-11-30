/**
 * @author Jakob Overrein
 *
 * Starts the game
 *
 */

"use strict";
let scene, renderer;

function play(){
    Physijs.scripts.worker = './lib/physijs_worker.js';
    Physijs.scripts.ammo = './lib/ammo.js';
    const canvas = document.getElementById("canvas");

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
    renderer.setClearColor(0xFFFFFF, 0xFF);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    let menu = new Main_Menu(scene, renderer);
    let level = new Level(scene, renderer);

    menu.start();

}