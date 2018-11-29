/**
 * Diverse generelle funksjoner.
 */

//Koordinatsystemet:
function addCoordSystem() {
	addAxis(1); //x-aksen.
	addAxis(2); //y-aksen.
	addAxis(3); //z-aksen.
}

var SIZE = 1000;

//Legger til enkeltakse (stiplet for negativ del av aksen)
//Bruker Geometry - klassen til å lage egne "modeller", her akser som 
//hver består av to punkter av type THREE.Vector3()
function addAxis(axis) {
	var fromNeg = new THREE.Vector3(0, 0, 0);
	var toNeg = new THREE.Vector3(0, 0, 0);
	var fromPos = new THREE.Vector3(0, 0, 0);
	var toPos = new THREE.Vector3(0, 0, 0);
	var axiscolor = 0x000000;

	switch (axis) {
		case 1: //x-aksen
			fromNeg = new THREE.Vector3(-SIZE, 0, 0);
			;
			toNeg = new THREE.Vector3(0, 0, 0);
			fromPos = new THREE.Vector3(0, 0, 0);
			toPos = new THREE.Vector3(SIZE, 0, 0);
			axiscolor = 0xff0000;
			break;
		case 2: //y-aksen
			fromNeg = new THREE.Vector3(0, -SIZE, 0);
			toNeg = new THREE.Vector3(0, 0, 0);
			fromPos = new THREE.Vector3(0, 0, 0);
			toPos = new THREE.Vector3(0, SIZE, 0);
			axiscolor = 0x00ff00;
			break;
		case 3: //z-aksen
			fromNeg = new THREE.Vector3(0, 0, -SIZE);
			toNeg = new THREE.Vector3(0, 0, 0);
			fromPos = new THREE.Vector3(0, 0, 0);
			toPos = new THREE.Vector3(0, 0, SIZE);
			axiscolor = 0x0000ff;
			break;
	}

	var posMat = new THREE.LineBasicMaterial({linewidth: 2, color: axiscolor});
	var negMat = new THREE.LineDashedMaterial({linewidth: 2, color: axiscolor, dashSize: 0.5, gapSize: 0.1});

	var gNeg = new THREE.Geometry();
	gNeg.vertices.push(fromNeg);
	gNeg.vertices.push(toNeg);
	var coordNeg = new THREE.Line(gNeg, negMat, THREE.LinePieces);
	gNeg.computeLineDistances(); // NB!
	scene.add(coordNeg);

	var gPos = new THREE.Geometry();
	gPos.vertices.push(fromPos);
	gPos.vertices.push(toPos);
	var coordPos = new THREE.Line(gPos, posMat, THREE.LinePieces);
	gPos.computeLineDistances();
	scene.add(coordPos);
}

//Finner min & max x,z og y verdi for alle vertekser til meshet.
//Bruker disse til å beregne hvor mye modellen må flyttes i x,y og z-retning for å sentreres.
//Kalkulerte verdier knyttes til mesh-objektet som henholdsvis: centerX, centerY og centerZ.
//Disse verdiene kan så brukes til å sentrere modellen før evt. rotasjon om en av aksene.
function calculateCenterValues(mesh) {
	var minX = 100000, maxX = -10000; //Settes til usansynlig stor og liten verdi.
	var minY = 100000, maxY = -10000;
	var minZ = 100000, maxZ = -10000;
	for (var vertexIndex = 0; vertexIndex < mesh.geometry.vertices.length; vertexIndex++) {
		if (mesh.geometry.vertices[vertexIndex].x < minX)
			minX = mesh.geometry.vertices[vertexIndex].x;
		if (mesh.geometry.vertices[vertexIndex].y < minY)
			minY = mesh.geometry.vertices[vertexIndex].y;
		if (mesh.geometry.vertices[vertexIndex].z < minZ)
			minZ = mesh.geometry.vertices[vertexIndex].z;

		if (mesh.geometry.vertices[vertexIndex].x > maxX)
			maxX = mesh.geometry.vertices[vertexIndex].x;
		if (mesh.geometry.vertices[vertexIndex].y > maxY)
			maxY = mesh.geometry.vertices[vertexIndex].y;
		if (mesh.geometry.vertices[vertexIndex].z > maxZ)
			maxZ = mesh.geometry.vertices[vertexIndex].z;
	}

	mesh.centerX = -((maxX + minX) / 2);
	mesh.centerY = -((maxY + minY) / 2);
	mesh.centerZ = -((maxZ + minZ) / 2);
}


//Roterer mesh om x-aksen:
function rotateMeshX(_mesh, _angle) {
	if (_mesh != undefined) {
		//Flytt tilbake:
		_mesh.translateX(-_mesh.centerX);
		_mesh.translateY(-_mesh.centerY);
		_mesh.translateZ(-_mesh.centerZ);
		_mesh.rotation.x = _angle;
		//Sentrer:
		_mesh.translateX(_mesh.centerX);
		_mesh.translateY(_mesh.centerY);
		_mesh.translateZ(_mesh.centerZ);
	}
}

//Roterer mesh om y-aksen:
function rotateMeshY(_mesh, _angle) {
	if (_mesh != undefined) {
		//Flytt tilbake:
		_mesh.translateX(-_mesh.centerX);
		_mesh.translateY(-_mesh.centerY);
		_mesh.translateZ(-_mesh.centerZ);
		_mesh.rotation.y = _angle;
		//Sentrer:
		_mesh.translateX(_mesh.centerX);
		_mesh.translateY(_mesh.centerY);
		_mesh.translateZ(_mesh.centerZ);
	}
}

//Fra: http://blog.thematicmapping.org/2013/10/terrain-building-with-threejs.html
//Returnerer et array (resp) bestående av 16 bits heltall.
function loadTerrain(file, callback) {
	var xhr = new XMLHttpRequest();
	xhr.responseType = 'arraybuffer';
	xhr.open('GET', file, true);
	xhr.onload = function (evt) {
		if (xhr.response) {
			var resp = new Uint16Array(xhr.response);
			callback(resp);
		}
	};
	xhr.send(null);
}

//Lager heightmap-array basert på bilde (img).
//Returnerer et array med en høydeverdi for hver piksel. Denne er beregnet som r+g+b / 30;
//Fra; https://github.com/mrdoob/three.js/issues/1003
function getHeightData(fileName, _width, _height, callback) {
	var canvas = document.createElement('canvas');
	canvas.width = _width;
	canvas.height = _height;
	var context = canvas.getContext('2d');
	var size = _width * _height;
	var heightData = new Float32Array(size);

	var img = new Image();	//NB! Image-objekt.
	img.onload = function () {
		//Ferdig nedlastet:
		context.drawImage(img, 0, 0);
		for (var i = 0; i < size; i++) {
			heightData[i] = 0;
		}

		//imgd = et ImageData-objekt. Inneholder pikseldata. Hver piksel består av en RGBA-verdi (=4x8 byte).
		var imgd = context.getImageData(0, 0, _width, _height);
		var pix = imgd.data;	//pix = et Uint8ClampedArray - array. 4 byte per piksel. Ligger etter hverandre.

		var j = 0;
		//Gjennomløper pix, piksel for piksel (i += 4). Setter heightData for hver piksel lik summen av fargen / 10 (f.eks.):
		for (var i = 0, n = pix.length; i < n; i += (4)) {
			var all = pix[i] + pix[i + 1] + pix[i + 2];
			heightData[j++] = all / 3;
		}
		callback(heightData);
	};
	//Starter nedlasting:
	img.src = fileName;
}