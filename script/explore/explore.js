var scene = new THREE.Scene();
var keyboard = new KeyboardState();

//Scale the camera
var pixelsToUnits = 1 / 16.0;
var width = window.innerWidth * pixelsToUnits ;
var height = window.innerHeight * pixelsToUnits;

var camera = new THREE.OrthographicCamera();
setupOrthoCam();
camera.updateProjectionMatrix();

var renderer = new THREE.WebGLRenderer({antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//var box = makeBox(1,1);
var down = new THREE.Vector3(0,0,-1);
var game;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var worldMouse = new THREE.Vector3();

camera.position.set(0,0,500);

//actors
var hero;
var frames = 0;

var render = function() {
	//prep keyboard and mouse
  raycasterUpdate();
  keyboard.update();
  //control all creatures
  controlAll();
  //evaluate collisions & tamper velocity accordingly
  rufio.checkCollisions(scene);
  //apply updates
  update();
  //RENDER

  requestAnimationFrame(render);
  renderer.render(scene, camera);
  //Clean scene of decayed and/or toBeRemoved bodies
  rufio.cleanScene(scene);
};

var raycasterUpdate = function(){
	// update the picking ray with the camera and mouse position	
	raycaster.setFromCamera( mouse, camera );	
	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children );
	for ( var i = 0; i < intersects.length; i++ ) {
		intersects[ i ].object.userData.mouseOver();
	}
	worldMouse.x = raycaster.ray.origin.x;
	worldMouse.y = raycaster.ray.origin.y;
};

var update = function() {
	frames += 1;
	if(keyboard.down("space")){
		spawnZombie(rufio.UserZombie);
	}
	if(frames > 100000) {
		//nothing
	}
	else if(frames % 120 == 0){
		spawnZombie(rufio.UserZombie);
		console.log("Frames: " + frames);
	}
	else if(frames % 250 == 0){
		spawnZombie(rufio.UserFastZombie);
	}

	var entities = getEntities();
	for(var e = 0; e < entities.length; e++){
		if(entities[e].userData)
			entities[e].userData.update();
	}
};

var spawnZombie = function(CreatureClass){
	var spawnPosition = new THREE.Vector3(THREE.Math.randFloat(30,40),0, 1);
	spawnPosition.applyAxisAngle(new THREE.Vector3(0,0,1), THREE.Math.randFloat(0,2*Math.PI));
	spawnPosition.add(hero.userData.position);
	return rufio.createCreature(CreatureClass, 1, spawnPosition);
};

var controlAll = function(){
	var entities = getEntities();
	for(var e = 0; e < entities.length; e++){
		if(entities[e].userData)
			entities[e].userData.control();
	}
};

var createLevel = function(){
	var spawnPosition = new THREE.Vector3(-5,0,0);
	hero = rufio.createCreature(rufio.UserHero, 1, spawnPosition);
	//TODO: remove test creature
	//spawnZombie();
};

var getEntities = function(){
	var entities = [];
	for(var e =0; e < scene.children.length; e++){
		//if(scene.children[e] instanceof THREE.Mesh){
			entities.push(scene.children[e]);
		//}
	}
	return entities;
};

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    //camera.aspect = window.innerWidth / window.innerHeight;
    setupOrthoCam();
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight);
};

function setupOrthoCam(){
	var width = window.innerWidth * pixelsToUnits ;
	var height = window.innerHeight * pixelsToUnits;
	camera.left = width / - 2;
	camera.right = width / 2;
	camera.top = height / 2;
	camera.bottom = height / - 2;
	camera.near = 1;
	camera.far = 1000;
};

function createGrid(x,y){
	for(var ix = 0; ix < x; ix++){
		for(var iy = 0; iy < x; iy++){
			var box = rufio.createBasicCircle(1);
			box.userData.position.set(ix*2, iy*2, 0);
		}
	}
};

function addLight(){
	var light = new THREE.PointLight(0xffffff);
	light.position = hero.userData.position;
	light.userData = new rufio.MyUserData(light, rufio.BodyType.ORNAMENTAL);
	light.userData.zIndex = 10;
	light.distance = 20;
	light.userData.control = function(){
		this.position.copy(hero.userData.position);

	};
	scene.add(light);
};

function addDirectionalLight(){
	var light = new THREE.DirectionalLight(0xffffff);
	light.userData = new rufio.MyUserData(light, rufio.BodyType.ORNAMENTAL);
	light.userData.zIndex = 10;
	light.target.position.set(0,0,-100);
	light.distance = 20;
	scene.add(light);
};

function addFlash(position){
	var light = new THREE.PointLight(0xffffff);
	light.position = new THREE.Vector3();
	light.position.copy(position);
	light.userData = new rufio.BulletFlash(light);
	light.distance = 30;
	light.intensity = 3;
	rufio.createBasicCircle(0.5).userData.position.copy(position);
	scene.add(light);
};


function onMouseDown( event ) {
	mouseShot(scene.children[0]);
};

var mouseShot = function(shooter){
	var bRad = 0.2;
	var direction = new THREE.Vector3(0,0,0);
	direction.x = raycaster.ray.origin.x; direction.y = raycaster.ray.origin.y;
	//TODO: mouse in world space!!!!!!!!!!!!!!
	direction.sub(shooter.userData.position).normalize().multiplyScalar(1);

	var spawnPosition = new THREE.Vector3(0,0,0);
	spawnPosition.copy(shooter.userData.position);

	var offset = new THREE.Vector3(0,0,0);
	offset.copy(direction).normalize().multiplyScalar(shooter.userData.radius + bRad + 0.0001);
	spawnPosition.add(offset);
	rufio.spawnBullet(bRad, spawnPosition, direction);
};

document.addEventListener( 'mousedown', onMouseDown, false );

function onMouseMove( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;		
};
window.addEventListener( 'mousemove', onMouseMove, false );

function testClasses(){
	var Thing = function(){
		this.talk = function(){
			console.log("Hello, Sailor!");
		};
	};

	var hey = function(someclass){
		var x = new someclass();
		x.talk();
	};
	hey(Thing);
};

//testClasses();
//createGrid(3,4);
createLevel();
console.log(hero);
addDirectionalLight();
//create floor
var c = rufio.createCircle(100, 12, rufio.materials.whiteMaterial);
c.userData.zIndex = -10;
c.userData.bodyType = rufio.BodyType.ORNAMENTAL;

// Spawn zombies right away
for (var zombieIndex = 3; zombieIndex >= 0; zombieIndex--) {
  spawnZombie(rufio.UserZombie);
}

render();