

var Particles = Kitty.Class.extend({

    options : {
        gravity : 0.5,
        particleCount : 20,
        color : "rgb(255,255,0)"
    },

    initialize : function() {
        _.bindAll(this);

        this.canvas = $("#canvas").get(0);
        this.ctx = this.canvas.getContext("2d");

        this.options.W = this.canvas.width;
        this.options.H = this.canvas.height;

        this.particles = [];
        _.times(this.options.particleCount, function() {
            this.particles.push(new Particle(this.ctx, this.options));
        }, this);
    },

    start : function() {
        requestAnimationFrame(this.onAnimationFrame);
    },

    onAnimationFrame : function() {

        this.ctx.clearRect(0, 0, this.options.W, this.options.H);

        _.each(this.particles, function(particle) {
            particle.cycle();
        });

        requestAnimationFrame(this.onAnimationFrame);
    }

});


var Particle = Kitty.Class.extend({

    initialize : function(context, options) {
        this.options = options;
        this.ctx = context;
        this.radius = 5;
        this.reset();
    },
    
    reset : function() {
        this.color = this.options.color;
        this.vx = Math.random() * 4 - 2;
        this.vy = Math.random() * -14 - 7;
        this.x = this.options.W / 2;
        this.y = this.options.H - this.radius;
    },

    cycle : function() {

        // The particles simply go upwards
        // It MUST come down, so lets apply gravity
        this.vy += this.options.gravity;

        // Adding velocity to x and y axis
        this.x += this.vx;
        this.y += this.vy;

        // We're almost done! All we need to do now
        // is to reposition the particles as soon
        // as they move off the canvas.
        // We'll also need to re-set the velocities

        if (   (this.x + this.radius > this.options.W)  // off the right side
            || (this.x - this.radius < 0 )              // off the left side
            || (this.y + this.radius > this.options.H)  // off the bottom
            ) {

            this.reset();
        
        }

        this.draw();
    },

    draw : function() {
        var ctx = this.ctx;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fill();
        ctx.closePath();
    }

});
