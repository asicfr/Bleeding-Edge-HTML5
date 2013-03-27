
/* LocalStorage */

var Storage = {

    get : function(key) {
        return JSON.parse(localStorage.getItem(key));
    },

    set : function(key, value) {
        return localStorage.setItem(key, JSON.stringify(value));
    }

};


var Game = Backbone.Model.extend({

    initialize : function() {
        _.bindAll(this);
        socket.on("game:sync", this.onServerSync)
    },

    start : function() {
        var userData = Storage.get("userData");
        if(userData) {
            this.authenticate(userData);
        } else {
            this.showLoginLayer();
        }

    },



    /* Web Sockets */

    authenticate : function(userData) {
        socket.emit("game:authenticate", userData);
    },





    logIn : function(email) {
        var userData = {
            email : email
        };
        Storage.set("userData", userData);
        this.authenticate(userData);
    },

    showLoginLayer : function() {

        console.log("showLoginLayer !");
        var loginLayer = new Kitty.LoginLayer();
        loginLayer.open();

    },

    onServerSync : function(data) {

        // console.log("server sync", data);

        this.set(data);
        this.trigger("game:sync", data);
    }

});



$(function() {
    var game = window.game = new Game();
    game.start();
});
