var PhotoBooth = Backbone.View.extend({

  el : "#photobooth",

  events : {
    "click" : "takePicture"
  },

  initialize : function() {
    _.bindAll(this);
    $(".thankyou").click(this.toggleBadge);
    this.toggleWebcam();
    
    this.video = $('#video');
    this.canvas = $('#canvas');
    this.cv = canvas.getContext('2d');
    
  },

  toggleWebcam : function() {
    var self = this;
    navigator.webkitGetUserMedia({
      audio:true,
      video:true
    }, function( stream ) {
      var s = stream;
      this.video.src = window.webkitURL.createObjectURL(stream);
      this.video.addEventListener('play',
        function() {
          setInterval(self.display,1000/25);
        }
      );
    }, function() {
      console.log('Denied');
    });
  },

  showNyan : function() {
        $('.svg-badge').fadeOut(function(){$('.svg-badge').remove()});
        $("#nyan").fadeIn();
  },

  showPhotobooth : function() {
        $("#nyan").fadeOut();
        $("#photobooth").fadeIn();
  },

  showFireworks : function() {
        $("#fireworks").css({ opacity: 0.5 });
  },

  toggleBadge : function(){

    // var self = this;
    // if(self.timer)
    //     clearTimeout(self.timer);
    // self.timer = setTimeout(function() {
    //     self.timer = null;
    // }, 30000);

    var self = this;
    var t1= setInterval(self.showNyan(),30000);
    var t2= setInterval(self.showPhotobooth(),40000);
    var t3= setInterval(self.showFireworks(),45000);

    


  },

  nyan : function(){
    //TODO
  },

  display : function(){
    var compression = 5;
    var width = 0;
    var height = 0;
    if ( this.canvas[0].width != this.video[0].videoWidth ) {
      width = Math.floor( this.video[0].videoWidth / compression );
      height = Math.floor( this.video[0].videoHeight / compression );
      this.canvas[0].width = width;
      this.canvas[0].height = height;
    }
    
    this.cv.drawImage(this.video[0],width,0,-width,height);
  },

  takePicture: function(){
    console.log('take a picture');
    //cv.getImageData(0,0,width,height);

    //draw=cv.getImageData(0,0,width,height);
    //c_.putImageData(draw,0,0)
  }
});
