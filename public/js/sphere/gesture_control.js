var aGesture	= new AugmentedGesture().enableDatGui().start();

//setTimeout(function(){
//	aGesture.destroy();
//}, 2000)

// put the debug texture on top
aGesture.domElementThumbnail();
//aGesture.domElementFullpage();

var pointerId	= "right";
var pointerOpts	= new AugmentedGesture.OptionPointer();
pointerOpts.pointer.crossColor	= {r:    0, g: 255, b:   0};
pointerOpts.colorFilter.r	= {min: 145, max: 255};
pointerOpts.colorFilter.g	= {min: 125, max: 255};
pointerOpts.colorFilter.b	= {min:   0, max:  90};
aGesture.addPointer(pointerId, pointerOpts);

var pointerId	= "left";
var pointerOpts	= new AugmentedGesture.OptionPointer();
pointerOpts.pointer.crossColor	= {r:    0, g: 255, b: 255};
pointerOpts.colorFilter.r	= {min: 145, max: 255};
pointerOpts.colorFilter.g	= {min:   0, max: 120};
pointerOpts.colorFilter.b	= {min:   0, max: 190};
aGesture.addPointer(pointerId, pointerOpts);

aGesture.bind('mousemove.left', function(pointers){
    console.log("mousemove.left", pointers)
});


aGesture.bind('mousemove.right', function(pointers){
    console.log("mousemove.right", pointers)
});

//var gestureR	= new AugmentedGesture.GestureRecognition();
//var gestureL	= new AugmentedGesture.GestureRecognition();
//aGesture.bind('update', function(pointers){
//	var canvas	= aGesture.domElement();
//	var pointerR	= pointers['right'];
//	var pointerL	= pointers['left'];
//	var eventR	= gestureR.update(pointerR.x, pointerR.y, canvas.width, canvas.height);
//	var eventL	= gestureL.update(pointerL.x, pointerL.y, canvas.width, canvas.height);
//	if( eventR )	console.log("gesture RIGHT event", eventR)
//	if( eventL )	console.log("gesture LEFT  event", eventL)
//});