// R2JS: Rufio 2 JS
// ----------------
// A homebrew 2D HTML5 Game API
//
// Authored by Studio Rufio aka Christopher Hyde
// All Rights Reserved 2015

var r2 = r2 || {};

const r2.debug = true;

r2.log = function(module, content){
	if(r2.debug) console.log(module + ":: " + content);
};

r2.init = function(){
	r2.Engine = Matter.Engine,
	r2.World = Matter.World,
	r2.Bodies = Matter.Bodies;
};


r2.Debug_Display_Mode = {
    NONE: "none",
    NO_PROJECTILES: "no projectiles",
    CREATURES: "creatures",
    ALL: "all"
};

r2.DEBUG = true;
r2.dbDisplay = r2.Debug_Display_Mode.ALL;

r2.MyUserData = function(obj3D, matterBody) {
    
    this.obj3D = obj3D;
    this.body = matterBody;

    this.forceModifier

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
        //TODO: This should happen last in the render loop
        if(r2.DEBUG ) this.updateDebug();  //&& rufio.dbDisplay != rufio.Debug_Display_Mode.NONE
    };

    // To be set by child classes:
    //  For modification that happens dynamically in child classes
    this.customModifiers = function() {};

    this.control = function(){};

    this.mouseOver = function() {};

    this.handleCollision = function(collidingObject) {};

    //  May be custom for individual objects
    this.constructDebugText = function(){
        return "" + this.position.x.toFixed(2) +", " + this.position.y.toFixed(2) + "<br>" + this.orientation.toFixed(2);
    }

    //  Should not be modified.  Displays debug info.
    this.updateDebug = function(){
        //determine position
        var y = -(this.position.y)/pixelsToUnits+(window.innerHeight/2);
        var x = (this.position.x)/pixelsToUnits+(window.innerWidth/2)+15;


        if(r2.dbDisplay == r2.Debug_Display_Mode.NONE){
            this.debugDiv.style.display = "none";
        }
        else{
            this.debugDiv.style.display = "inline";
            this.debugDiv.innerHTML = this.constructDebugText();
            this.debugDiv.style.top = y + 'px';
            this.debugDiv.style.left = x + 'px';
        }
        //only display debug info *inside* the browser window.  (this will avoid scroll bars)
        if(y < window.innerHeight*.2  || y > window.innerHeight*.8
            || x < window.innerWidth*.2  || x > window.innerWidth*.8){
            this.debugDiv.style.display = "none";
        }
    }

    //  TODO: on create: debug info
    if(r2.DEBUG){
        //this.debugDiv = rufio.createDebugText(this.obj3D.id);// Release version will never reach this
    }
};
