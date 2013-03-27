var objects = [];
var targets = { table: [], sphere: [] };

var SphereElement = Backbone.View.extend({

    tagName : "div",
    className : "element",

    initialize : function(options) {
        _.bindAll(this);
        this.options = options;
        this.player = null;
        this.construct();
    },

    construct : function() {
        this.ui = {};

        // number
        this.ui.email = $("<div>").addClass("number").appendTo(this.$el);

        // avatar
        this.ui.avatar = $("<div>").addClass("symbol").appendTo(this.$el);

        // avatar - identicon
        this.ui.canvas = $("<canvas>").attr("width", 100).attr("height", 100).appendTo(this.ui.avatar);
        // new Identicon(this.ui.canvas.get(0), "fake", 100);

        // score
        this.ui.score = $("<div>").addClass("details").appendTo(this.$el);

        // 3d object
        this.object = new THREE.CSS3DObject(this.el);
        this.object.position.x = Math.random() * 4000 - 2000;
        this.object.position.y = Math.random() * 4000 - 2000;
        this.object.position.z = Math.random() * 4000 - 2000;
    },

    setPlayer : function(player) {

        if((!this.player) || this.player.email != player.email) {
            //this.ui.email.text(player.email);
            this.ui.email.text("");

            this.ui.canvas && this.ui.canvas.remove();
            this.ui.image && this.ui.image.remove();
            this.ui.canvas = null;
            this.ui.image = null;
            USE_GRAVATAR = false;

            if(player.hal) {
                this.ui.image = $("<img>").width(100).height(100).attr("src", "/images/hal_9000.jpg").appendTo(this.ui.avatar);
            } else {


                /* CryptoJS and Gravatars */

                var hexaHash = CryptoJS.MD5(player.email).toString();

                if(USE_GRAVATAR) {
                    this.ui.image = $("<img>").width(100).height(100).attr("src", "http://www.gravatar.com/avatar/" + hexaHash).appendTo(this.ui.avatar);
                } else {
                    var deciHash = parseInt(hexaHash, 16) % 10000000000; // seem to be the max limit for the hash...
                    this.ui.canvas = $("<canvas>").attr("width", 100).attr("height", 100).appendTo(this.ui.avatar);
                    new Identicon(this.ui.canvas.get(0), Math.floor(deciHash), 100);
                }

            }

        }

        this.ui.score.text(player.score);
        this.player = player;
    }

});



var ScoreSphere = Backbone.View.extend({

    el : "#container",

    options : {
        rowCount : 5,
        lineCount : 4,
        maxCount : 20
    },

    initialize : function() {
        _.bindAll(this);
        this.initScene();
        this.initObjects();

        this.transform( targets.table, 5000 );
        this.animate();

        $(window).resize(this.onWindowResize);

        game.on("game:sync", this.onGameSync);
    },

    onGameSync : function(gameData) {
        var players = gameData.players;

        _.each(_.values(this.elements), function(element, i) {
            var player = players[i % players.length];
            element.setPlayer(player);
        });

    },

    initScene : function() {
        // scene
        var scene = this.scene = new THREE.Scene();

        // camera
        var camera = this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 5000 );
        camera.position.z = 900;

        // renderer
        var renderer = this.renderer = new THREE.CSS3DRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        $(renderer.domElement).addClass("renderer").css({position : "absolute"});
        this.$el.append(renderer.domElement);

        // rotation value for rotate()
        this.rotation = 300;

        // trackball controls
        var controls = this.controls = new THREE.TrackballControls( camera, renderer.domElement );
        controls.rotateSpeed = 0.5;
        controls.addEventListener('change', this.render);
        console.log(controls);

        // buttons
        // TODO : gonna move.
        var self = this;
        var button = document.getElementById( 'table' );
        button.addEventListener( 'click', function ( event ) {
            self.transform( targets.table, 2000 );
        }, false );

        var button = document.getElementById( 'sphere' );
        button.addEventListener( 'click', function ( event ) {
            self.transform( targets.sphere, 2000 );
        }, false );


    },

    initObjects : function() {
        this.elements = [];

        // items
        for ( var i = 0; i < this.options.maxCount; i ++ ) {

            var element = new SphereElement({index : i});
            this.elements.push(element);

            this.scene.add( element.object );
            objects.push( element.object );

        }

        var rowCount = this.options.rowCount;
        var lineCount = this.options.lineCount;

        for(var lineNumber = 0; lineNumber < lineCount; lineNumber++) {
            for(var rowNumber = 0; rowNumber < rowCount; rowNumber++) {

                var object = new THREE.Object3D();
                object.position.x = (rowNumber * 200) - 400;
                object.position.y = (lineNumber * 220) - 300;
                targets.table.push( object )
            }
        }


        // sphere
        var vector = new THREE.Vector3();
        var sphereRadius = 400;
        for ( var i = 0, l = objects.length; i < l; i ++ ) {
            var phi = Math.acos( -1 + ( 2 * i ) / l );
            var theta = Math.sqrt( l * Math.PI ) * phi;
            var object = new THREE.Object3D();
            object.position.x = sphereRadius * Math.cos( theta ) * Math.sin( phi );
            object.position.y = sphereRadius * Math.sin( theta ) * Math.sin( phi );
            object.position.z = sphereRadius * Math.cos( phi );
            vector.copy( object.position ).multiplyScalar( 2 );
            object.lookAt( vector );
            targets.sphere.push( object );
        }
    },

    animate : function () {
        requestAnimationFrame(this.animate);
        //console.log("x,y,z",this.camera.position.x,this.camera.position.y,this.camera.position.z);
        TWEEN.update();
        this.controls.update();
    },

    render : function () {
        this.renderer.render(this.scene, this.camera);
    },


    transform : function(targets, duration) {

        TWEEN.removeAll();

        for ( var i = 0; i < objects.length; i ++ ) {
            var object = objects[ i ];
            var target = targets[ i ];
            new TWEEN.Tween( object.position )
                .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
            new TWEEN.Tween( object.rotation )
                .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }

        new TWEEN.Tween(window).to( {}, duration * 2 ).onUpdate( this.render ).start();

    },

    rotate : function() {

        TWEEN.removeAll();

        var currentPosition = this.camera.position.x;
        if (currentPosition > 899 || currentPosition < -899 ) {
            this.rotation = -this.rotation;
        }

        var tween = new TWEEN.Tween( this.camera.position )
            .to( { x: currentPosition+this.rotation }, 800 )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        var newPosition = this.camera.position.x;
        var toPosition = 899;
        if (newPosition< 0) {
            toPosition = -toPosition;
        }

        TWEEN.removeAll();
        var tween = new TWEEN.Tween( this.camera.position )
            .to( { x: toPosition }, 2000 )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        TWEEN.removeAll();
        var tween = new TWEEN.Tween( this.camera.position )
            .to( { x: -toPosition }, 2000 )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();


    },


    onWindowResize: function() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

});





