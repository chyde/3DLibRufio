// rufio namespace
// weapons classes

rufio.ProjectileWeapon = function(){
	this.name = "Unnamed Projectile Weapon";
	this.active = true;
	this.ammo = 10;
	this.rpm = 100;
	this.damage = 1;
	this.velocity = 0.1;

    this.lastFrameFired = -6000;

    this.pullTrigger = function(){
        if(this.lastFrameFired + this.rmp/60 < this.frames){
            this.lastFrameFired = this.frames;
            this.shoot();
        }
    };
	this.shoot = function(){

        console.log(this.name + " fired a blank");
    };
};
rufio.ProjectileWeapon.prototype = Object.create(rufio.MyUserData.prototype);
rufio.ProjectileWeapon.prototype.constructor = rufio.ProjectileWeapon;

rufio.MeleeWeapon = function(){
	this.name = "Unnamed Melee Weapon";
};

rufio.spawnBullet = function(radius, position, velocity) {
    var circleGeometry = new THREE.CircleGeometry(radius, 16);
    var circle = new THREE.Mesh(circleGeometry, rufio.materials.bulletMaterial);
    circle.userData = new rufio.Bullet(circle, rufio.BodyType.STATIC, radius);
    scene.add(circle);
    circle.userData.position.copy(position);
    circle.userData.velocity.copy(velocity);
};

rufio.BulletFlash = function(obj3D){
    rufio.MyUserData.call(this, obj3D, rufio.BodyType.ORNAMENTAL);
    this.duration = 100;
    this.initialDistance = obj3D.distance;
    this.zIndex = 20;

    this.control = function(){
        var now = (new Date()).getTime();
        var percent = (this.duration+now-this.spawnTime)/this.duration;
        this.obj3D.distance = this.initialDistance;//  * percent;
        if(now >= this.spawnTime+this.duration) this.toBeRemoved = true;
    };
};
rufio.BulletFlash.prototype = Object.create(rufio.MyUserData.prototype);
rufio.BulletFlash.prototype.constructor = rufio.BulletFlash;


rufio.Bullet = function(obj3D, spawnPosition, radius) {
    rufio.UserCircle.call(this, obj3D, rufio.BodyType.INTERACTIVE, radius);
    
    this.damage = 1;
    this.hitObj3D = null;
    this.localHitPosition = new THREE.Vector3(0,0,0);
    this.localHitOrientation = null;
    this.airTime = 1000;
    this.blowBack = 0.2;
    this.zIndex = 1.5;
    //Time out function
    this.customModifiers = function() {
        var date = new Date();
        if (date.getTime() > this.spawnTime + this.airTime) {
            this.toBeRemoved = true;
        }
    };

    this.handleCollision = function(collidingObject) {
        try {
        	//TODO: bullet stays in position on creature
            //if NOT a bullet(as in it hit a solid object)
            if (!(collidingObject.userData instanceof rufio.Bullet)) {
                this.velocity.set(0, 0, 0);
                this.obj3D.material = new THREE.MeshBasicMaterial({
                    color: 0x991111
                });
                this.landBullet(collidingObject);
            }
            if(collidingObject.userData instanceof rufio.UserCreature){
            	collidingObject.userData.giveDamage(this.damage);
            };
        } catch (err) {
            console.log(collidingObject);
            console.log(err);
        }
    };

    this.landBullet = function(obj3D){
    	//Make inactive (only cause damage once)
        this.bodyType = rufio.BodyType.ORNAMENTAL;
        this.hitObj3D = obj3D;
    	this.localHitPosition.copy(this.hitObj3D.position).sub(this.position).negate();
        this.localHitOrientation = this.hitObj3D.userData.orientation;

    	//this.position.setZ(1);
    	this.airTime = 1000000; //Land forever
        console.log("Bullet landed");
    };

    this.customModifiers = function() {
        if(this.hitObj3D){
            //rest on the zombie
            var tmpLocalPos = (new THREE.Vector3()).copy(this.localHitPosition);
            rufio.rotate(new THREE.Vector3(), tmpLocalPos, this.hitObj3D.userData.orientation - this.localHitOrientation);
            this.position.copy(this.hitObj3D.position).add(tmpLocalPos);
        }
    };
};
rufio.Bullet.prototype = Object.create(rufio.UserCircle.prototype);
rufio.Bullet.prototype.constructor = rufio.Bullet;


