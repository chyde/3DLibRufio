/* 
 ** Rufio
 ** -----
 ** A namespace for the quick production of simple games.
 */
var date = new Date();
var rufio = rufio || {};
rufio.collision = {};
rufio.BodyType = {
    STATIC: "static",
    INTERACTIVE: "interactive",
    ORNAMENTAL: "ornamental"
};

rufio.MyUserData = function(obj3D, bodyType) {
    // These represent real values, and the object3D shall 
    // represent a valid pos for only one frame.
    this.frames = 0;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.position = new THREE.Vector3(0, 0, 0);

    //time for reference
    this.spawnTime = (new Date()).getTime();

    //modifiers (valid only 1 frame)
    this.velocityModifier = new THREE.Vector3(0, 0, 0);
    this.positionModifier = new THREE.Vector3(0, 0, 0);
    this.zIndex = 0;

    //this is the Parent object that contains this
    this.obj3D = obj3D;

    //Set bodyType, this identifies the box as contactable or not
    this.bodyType = bodyType;
    this.toBeRemoved = false;

    this.update = function() {
    	//update "time"
    	this.frames += 1;
        //consider modifiers
        this.customModifiers(); //run childClass's modifications (could be a menu pause or anything)
        //apply modifications
        //this.positionModifier.add(this.position).add(this.velocity).add(this.velocityModifier);
        //this.obj3D.position.copy(this.positionModifier);
        this.velocity.add(this.velocityModifier);
        this.position.add(this.velocity).add(this.positionModifier);
        this.obj3D.position.copy(this.position);
        //only the rendered position takes into account Z
        this.obj3D.position.z = this.zIndex;
        //clear mods
        this.velocityModifier.set(0, 0, 0);
        this.positionModifier.set(0, 0, 0);
    };

    // To be set by child classes:
    //  For modification that happens dynamically in child classes
    this.customModifiers = function() {};

    this.control = function(){};

    this.mouseOver = function() {};

    this.handleCollision = function(collidingObject) {};
};

rufio.UserCircle = function(obj3D, bodyType, radius) {
    rufio.MyUserData.call(this, obj3D, bodyType);
    this.radius = radius;
};
rufio.UserCircle.prototype = Object.create(rufio.MyUserData.prototype);
rufio.UserCircle.prototype.constructor = rufio.UserCircle;

rufio.UserRectangle = function(obj3D, bodyType, width, height) {
    rufio.MyUserData.call(this, obj3D, bodyType);
    this.width = width;
    this.height = height;
};
rufio.UserRectangle.prototype = Object.create(rufio.MyUserData.prototype);
rufio.UserRectangle.prototype.constructor = rufio.UserRectangle;

rufio.createBasicBox = function(width, height) {
    var material = new THREE.MeshBasicMaterial({
        color: 0x00ff00
    });
    return rufio.createBox(width, height, material);
};

//TODO: convert to create wall
rufio.createBox = function(width, height, material) {
    var geometry = new THREE.BoxGeometry(width, height, 0);
    var box = new THREE.Mesh(geometry, material);
    var ud = new rufio.MyUserData(box, rufio.BodyType.STATIC);
    box.userData = ud;
    // finish up
    scene.add(box);
    return box;
};

rufio.createBasicCircle = function(radius) {
    var material = new THREE.MeshBasicMaterial({
        color: 0x0000ff
    });
    return rufio.createCircle(radius, 16, material);
};

rufio.createCircle = function(radius, segments, material) {
    var circleGeometry = new THREE.CircleGeometry(radius, segments);
    var circle = new THREE.Mesh(circleGeometry, material);
    var ud = new rufio.UserCircle(circle, rufio.BodyType.STATIC, radius);
    circle.userData = ud;
    scene.add(circle);
    return circle;
};

rufio.controlObject3D = function(obj3D, direction) {
    direction.normalize().multiplyScalar(obj3D.userData.moveSpeed);
    obj3D.userData.velocity.copy(direction);
};

rufio.getDirectionalInput = function() {
    var control = new THREE.Vector3(0, 0, 0);
    if (keyboard.pressed("left") || keyboard.pressed("A")) {
        control.x += -1;
    }
    if (keyboard.pressed("up") || keyboard.pressed("W")) {
        control.y += 1;
    }
    if (keyboard.pressed("right") || keyboard.pressed("D")) {
        control.x += 1;
    }
    if (keyboard.pressed("down") || keyboard.pressed("S")) {
        control.y += -1;
    }
    return control;
};

rufio.cleanScene = function(scene) {
    for (var i = scene.children.length - 1; i >= 0; i--) {
        if (scene.children[i].userData.toBeRemoved) {
            scene.remove(scene.children[i]);
        }
    }
};

rufio.UserWall = function(boxObj3D, width, height){
    //all walls are square and static
    rufio.MyUserData.call(this, boxObj3D, rufio.BodyType.STATIC);
    this.width = width;
    this.height = height;
};
rufio.MyUserData.prototype = Object.create(rufio.MyUserData.prototype);
rufio.MyUserData.prototype.constructor = rufio.UserWall;


rufio.checkCollisions = function(scene) {
    //assemble interactive
    var inactiveBodies = [];
    var interactive = [];
    for (var i = 0; i < scene.children.length; i++) {
    	//interactive bodies need to be checked against ALL other physical bodies
        if (scene.children[i].userData.bodyType == rufio.BodyType.INTERACTIVE) {
            interactive.push(scene.children[i]);
        }
        // Static needs to be check upon, but they shall not check on each other
        else if(scene.children[i].userData.bodyType == rufio.BodyType.STATIC){
        	inactiveBodies.push(scene.children[i]);
        }
    }

    //check collisions
    for (var i = 0; i < interactive.length; i++) {
        // check inactive bodies
        for (var a = 0; a < inactiveBodies.length; a++) {
            // Identical bodies to be ignored (This may never be true)
            if (interactive[i] == inactiveBodies[a]) continue;
            if( rufio.collision.isColliding(interactive[i].userData, inactiveBodies[a].userData) ){
                interactive[i].userData.handleCollision(inactiveBodies[a]);
                inactiveBodies[a].userData.handleCollision(interactive[i]);
            }
            //circle square-collision
        }
        // check all other interactive
        for(var j = i+1; j < interactive.length; j++){
            if( rufio.collision.isColliding(interactive[i].userData, interactive[j].userData) ){
                interactive[i].userData.handleCollision(interactive[j]);
                interactive[j].userData.handleCollision(interactive[i]);
            }
        }
    }
};

rufio.collision.isColliding = function(userDataA, userDataB){
    if(userDataA instanceof rufio.UserCircle){
        if(userDataB instanceof rufio.UserCircle){
            return rufio.collision.circleCircle(userDataA, userDataB);
        }
    }
    //else if(userDataA instanceof User )
    return false;
};



rufio.collision.circleRectangle = function (circUD, rectUD){
    //We can expect these objects to have .position and .radius or .width .height
    if(rufio.collision.pointInRectangle(circUD.position, rectUD)) return true;
    //create points in the four corners
    var points = [];
    for(var x = -rectUD.width/2; x <= rectUD.width/2; x + width){
        for(var y = -rectUD.height/2; y <= rectUD.height/2; y + height){
            lines.push(new THREE.Vector3(x+rectUD.position.x, y+rectUD.position.y, 0));
        }
    }
    //test the 4 lines
    for(var i = 0; i < points.length; i++){
        var line = new THREE.Line(points[i], points[(i+1)%points.length]);
        if(rufio.collision.circleLine(circUD, line)) return true;
    }
    return false;
};

rufio.collision.pointInRectangle = function(point, rectUD){
    if(point.x > rectUD.position.x - rectUD.width/2 && 
            point.x < rectUD.position.x + rectUD.width/2 &&
            point.y > rectUD.position.y - rectUD.height/2 &&
            point.y < rectUD.position.y + rectUD.height/2){
        return true;
    }
    return false;
};

rufio.collision.collideCreatures = function(target, subject, restitution){
    //http://en.wikipedia.org/wiki/Inelastic_collision
    var va = new THREE.Vector3(0,0,0);

    va.copy(subject.velocity).sub(target.velocity);
    var mava = new THREE.Vector3(0,0,0);
    mava.copy(target.velocity).multiplyScalar(target.mass);
    var mbvb = new THREE.Vector3(0,0,0);
    mbvb.copy(subject.velocity).multiplyScalar(subject.mass);
    va.multiplyScalar(restitution).multiplyScalar(subject.mass).add(mava).add(mbvb);
    va.divideScalar(target.mass*subject.mass);
    //calculate the change in velocity
    target.velocity.copy(va);
   // va.sub(target.velocity);
  //  target.velocityModifier.add(va);
};

rufio.collision.circleCircle = function (circA, circB){ //Userdata parameters
     // circle-circle collision; distance between centers is shorter than combined radii
    var distCenters = Math.pow(circA.position.x - circB.position.x, 2);
    distCenters += Math.pow(circA.position.y - circB.position.y, 2);
    var lenRadii = Math.pow(circA.radius + circB.radius,2);
    if (lenRadii > distCenters) {
        return true;
    }
    return false;
};

rufio.collision.circleLine = function(circUD, line){
    var closestPoint = line.closestPointToPoint(circUD.position, true); //clamp to line segment
    if(circUD.position.distanceTo(closestPoint) < circUD.radius){
        return true;
    }
    return false;
};


//this is just to experiement
