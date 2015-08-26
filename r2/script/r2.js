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



