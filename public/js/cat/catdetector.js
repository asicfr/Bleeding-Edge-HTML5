var CatDropZone = Backbone.View.extend({

    el : "#viewer",

    events : {
        dragover    : "onDragOver",
        dragleave   : "onDragLeave",
        drop        : "onDrop"
    },

    onDragOver : function(e) {
        this.$el.addClass('dragover');
        return false;
    },

    onDragLeave : function(e) {
        this.$el.removeClass('dragover');
        return false;
    },

    onDrop : function(e) {
        this.$el.removeClass('dragover');


        // testing browser drop
        var dataTransfer = e.originalEvent.dataTransfer;
        var src = dataTransfer.getData("x-kittydar/url");
        if (src) {
            detectFromUrl(src);
        }



        // testing file drop
        var files = e.originalEvent.dataTransfer.files;
        if (files.length) {
            detectFromFiles(files);
        }

        return false;
    }

});


$(document).ready(function() {

    var viewer = new CatDropZone();

    var examples = $('.example-thumb');




    /* dataTransfer setData */
    
    examples.on('dragstart', function(e) {
        e.originalEvent.dataTransfer.setData('x-kittydar/url', this.src);
    });




    if (window.webkitNotifications.checkPermission() != 0) { 
        window.webkitNotifications.requestPermission();
    }
    
});

function detectFromUrl(src) {
    var img = new Image();
    img.onload = function() {
        detectImage(img);
    };
    img.src = src;
}

function detectImage(img) {
    drawToCanvas(img);
    detector.abortCurrent();
    detector.detectCats();
}

function detectFromFiles(files) {
    var file = files[0];
    var imageType = /image.*/;

    if (!file.type.match(imageType)) {
        return;
    }

    var img = new Image();



    /* New FileReader */


    var reader = new FileReader();
    reader.onload = function(e) {
        img.onload = function() {
            detectImage(img);
        };
        $("#progress").text("loading image...");
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);





}

function drawToCanvas(img) {
    var width = img.width;
    var height = img.height;

    var max = Math.max(width, height);
    var scale = Math.min(max, 420) / max;

    width *= scale;
    height *= scale;

    $("#viewer-container").width(width).height(height);
    $("#viewer").width(width).height(height);

    var anno = $("#annotations").get(0);
    anno.width = width
    anno.height = height;

    var canvas = $("#preview").get(0);
    canvas.width = width;
    canvas.height = height;

    // draw image to preview canvas
    var context = canvas.getContext("2d");
    context.drawImage(img, 0, 0, img.width, img.height,
        0, 0, width, height);
}

var detector = {

    abortCurrent: function() {
        if (this.worker) {
            this.worker.terminate();
        }
    },

    detectCats: function() {
        $("#progress").text("detecting cats...");

        var canvas = $("#preview").get(0);

        if (window.Worker) {


            /* Web Workers */

            var worker = new Worker("/libs/kittydar/detection-worker.js");

            worker.onmessage = this.onMessage;
            worker.onerror = this.onError;

            kittydar.setOptions({
                scaleStep: 6
            });
            var resizes = kittydar.getAllSizes(canvas);


            /* Post Message */

            worker.postMessage(resizes);





            this.worker = worker;
        }
        else {
            var rects = kittydar.detectCats(canvas, network);
            this.paintCats(rects);
        }
    },

    paintCats : function(rects) {
        var noun = rects.length == 1 ? "cat" : "cats";
        var pts = rects.length == 1 ? "pt" : "pts";
        $("#progress").text(rects.length + " " + noun + " detected: "+rects.length+pts);
        this.clearRects();
        this.paintRects(rects, "red");
    },

    clearRects: function() {
        var canvas = $("#annotations").get(0);
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    paintRects : function(rects, color) {
        var canvas = $("#annotations").get(0);
        var ctx = canvas.getContext("2d");

        ctx.lineWidth = 2;
        ctx.strokeStyle = color || "red";

        for (var i = 0; i < rects.length; i++) {
            var rect = rects[i];
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        }
    },

    onMessage : function(event) {
        var data = event.data;
        if (data.type == 'progress') {
            detector.showProgress(data);
        }
        else if (data.type == 'result') {
            detector.onCatResultMessage(data.cats);
        }
    },

    onCatResultMessage : function(cats) {
        console.log(cats.length + " cats detected: "+cats.length+"pts");
        socket.emit("cat:detected", { count : cats.length });
        this.paintCats(cats);

    },

    onError : function(event) {
        console.log("Error from detection Worker:", event.message)
    },

    showProgress : function(progress) {
        this.paintRects(progress.rects, "orange");
        $("#progress").text("detecting at " + progress.size + "px...");
    }
};
