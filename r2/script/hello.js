//hello test


window.onload = function() {
// Matter.js module aliases
	var Engine = Matter.Engine,
	World = Matter.World,
	Bodies = Matter.Bodies;

	// create a Matter.js engine
	var engine = Engine.create();

	// create two boxes and a ground
	var boxA = Bodies.rectangle(400, 200, 80, 80);
	var boxB = Bodies.rectangle(450, 50, 80, 120);
	var ground = Bodies.rectangle(400, 610, 1000, 60, { isStatic: true });

	// add all of the bodies to the world
	World.add(engine.world, [boxA, boxB, ground]);

	// run the engine
	//Engine.run(engine);
	var f = function(){	for(var i = 0; i < 10; i++){
		console.log(boxA.position);
	}};
	setTimeout(f,0);

};