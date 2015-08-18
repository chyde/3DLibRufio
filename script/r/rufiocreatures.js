// rufio namespace
// creature // Hero and Zombies


/*
* Define some materials to be reused in the game
*/
rufio.materials = {
	whiteMaterial: new THREE.MeshLambertMaterial({
						    color: 0xffffff
						}),
	zombieMaterial: new THREE.MeshLambertMaterial({
						    color: 0x6d983f
						}),
	deadMaterial: new THREE.MeshLambertMaterial({
						    color: 0xa85c46
						}),
	humanMaterial: new THREE.MeshLambertMaterial({
						    color: 0x672f6e
						}),
	bulletMaterial: new THREE.MeshLambertMaterial({
						    color: 0x444444
						}),
	bloodMaterial: new THREE.MeshLambertMaterial({
						    color: 0x0000ee
						})
};

//TODO: remove bodyType param. creatures are inherently interactive.
rufio.UserCreature = function(obj3D, bodyType, radius) {
	rufio.UserCircle.call(this, obj3D, rufio.BodyType.INTERACTIVE, radius);

    this.health = 3;
    this.moveSpeed = 0.2;
    this.mass = 1;

    this.giveDamage = function(dmg){
    	this.health -= dmg;
    	if(this.health <= 0) this.die();
    };

    this.die = function(){
    	this.bodyType = rufio.BodyType.ORNAMENTAL;
    	this.obj3D.material = rufio.materials.deadMaterial;
    	this.velocity.set(0,0,0);
    	this.moveSpeed = 0;  //Hack way of stopping the dead
    	this.zIndex = -0.5;
    };

    this.handleCollision = function(collidingObject) {
    	//Copy positions with z = 0
    	/*
    	if(collidingObject.userData instanceof rufio.UserCreature){
	    	var myPos = new THREE.Vector3(this.position.x, this.position.y, 0);
	    	var collidingPos = new THREE.Vector3(0,0,0);
			collidingPos.copy(collidingObject.userData.position).setZ(0);

	    	var a = this.radius + collidingObject.userData.radius;
	    	var b = myPos.distanceTo(collidingPos);
	    	var scale = (b-a) / b;

	    	//myPos.sub(collidingPos);
	    	collidingPos.sub(myPos)
	    	//calculate projected velocity;
	    	console.log(scale);
	    	var tmpVelocity = new THREE.Vector3(this.velocity.x,this.velocity.y,0);
	    	if(tmpVelocity.angleTo(collidingPos) < Math.PI) this.velocity.add( tmpVelocity.projectOnVector().negate() );
	    	//this.velocity.add( collidingPos.projectOnVector(this.velocity).multiplyScalar(scale) );
	    }
	    */
	    if(collidingObject.userData instanceof rufio.UserCreature){
	    	//make some copies
	    	
	    	var myPos = new THREE.Vector3(this.position.x, this.position.y, 0);
	    	var collidingPos = new THREE.Vector3(0,0,0);
			//For z safety TODO: remove this next line
			collidingPos.copy(collidingObject.userData.position).setZ(0);
	    	var tmpVelocity = new THREE.Vector3(this.velocity.x,this.velocity.y,0);
	    	var diffCenters = myPos.sub(collidingPos);
	    	var projection = tmpVelocity.projectOnVector(diffCenters);
	    	var lengthProjection = projection.length();
	    	var offsetVelocity  = diffCenters.normalize().multiplyScalar(lengthProjection);
	    	this.velocityModifier.add( offsetVelocity );
	    	
	    	//rufio.collision.collideCreatures(this, collidingObject.userData, 0.5);
	    }
    };
};
rufio.UserCreature.prototype = Object.create(rufio.UserCircle.prototype);
rufio.UserCreature.prototype.constructor = rufio.UserCreature;


rufio.UserHero = function(obj3D, bodyType, radius) {
	rufio.UserCreature.call(this, obj3D, rufio.BodyType.INTERACTIVE, radius);
    this.health = 6;
    this.weapons = [];
    this.zIndex = 2;

    this.obj3D.material = rufio.materials.humanMaterial;
    
    this.control = function() {
    	//console("controling hero");
    	rufio.controlObject3D(this.obj3D, rufio.getDirectionalInput());
    };
    
};
rufio.UserHero.prototype = Object.create(rufio.UserCreature.prototype);
rufio.UserHero.prototype.constructor = rufio.UserHero;


rufio.UserZombie = function(obj3D, bodyType, radius) {
	rufio.UserCreature.call(this, obj3D, rufio.BodyType.INTERACTIVE, radius);
    this.health = 3;
    this.moveSpeed = 0.05;
    this.obj3D.material = rufio.materials.zombieMaterial;
    this.control = function(){
    	rufio.controlObject3D(this.obj3D, this.getBasicZombieDirection(hero));
    };

    this.getBasicZombieDirection = function(targetMesh) {
		var direction = new THREE.Vector3(0,0,0);
		direction.copy(targetMesh.userData.position).sub(this.position);
		return direction;
	};
};
rufio.UserZombie.prototype = Object.create(rufio.UserCreature.prototype);
rufio.UserZombie.prototype.constructor = rufio.UserZombie;


rufio.UserFastZombie = function(obj3D, bodyType, radius) {
	rufio.UserZombie.call(this, obj3D, rufio.BodyType.INTERACTIVE, radius);
    this.health = 2;
    this.moveSpeed = 0.12;

};
rufio.UserFastZombie.prototype = Object.create(rufio.UserZombie.prototype);
rufio.UserFastZombie.prototype.constructor = rufio.UserFastZombie;


rufio.createCreature = function(CreatureClass, radius, position) {
    var circleGeometry = new THREE.CircleGeometry(radius, 16);
    var material = rufio.materials.whiteMaterial;
    var circle = new THREE.Mesh(circleGeometry, material);
    circle.userData = new CreatureClass(circle, rufio.BodyType.STATIC, radius);
    circle.userData.position.copy(position);
    scene.add(circle);
    return circle;
};

