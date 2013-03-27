
// require(back.... na ! just kidding !

/**
 * Controller class for the HAL I.A, handling it's own view for now.
 *
 * @type {*}
 */
var Hal = Kitty.Class.extend({

    initialize : function(options) {
        this.state = options.state;
        this.state.on("user:question", this.onUserQuestion, this);
    },

    onUserQuestion : function(question) {
        this.handleQuestion(question);
    },

    handleQuestion : function(question) {
        // speak("new user message received");
        console.log("hal : new question from user", question);

        var self = this;
        _.defer(function() {
            self.state.trigger("hal:thinking", question);
        });


        var reply = this.getReply(question);

        _.delay(function() {

            halVoice.speak(reply.speech).then(function() {

                console.log("speaking now !");
                self.state.trigger("hal:reply", reply);

            });


        }, 1000);

    },

    getReply : function(question) {

        var question = $.trim(question);

        var speech, html, handler;
        if(/^hello/i.test(question)||/^bonjour/i.test(question)) {
            speech = "Hello, Human";
            html = "Hello, Human";
        } else if(/kitten/i.test(question)||/chaton/i.test(question)) {
            speech = "I found four kittens for you";
            html = speech + "<br/><br/>";
            handler = this.kittyFinderHandler;
        } else if(/how/i.test(question)||/comment/i.test(question)) {
            speech = "I use window AudioContext of course";
            html = "I use window AudioContext";
        } else if(/happy/i.test(question)||/heureux/i.test(question)) {
            speech = "I am not capable of that emotion";
            html = "I am not capable of that emotion";
        } else if(/allo/i.test(question)) {
            speech = "Your are a web developper and you don't use HTML5 ? Nan meh allo ko ah!";
            html = "Your are a web developper and you don't use HTML5 ? Nan meh allo ko ah!";
        } else if(/end/i.test(question)||/fin/i.test(question)) {
            speech = "Thank you Devoxx!";
            html = "Thank you Devoxx!";
        } else {
            speech = "Sorry, I didnt understand your question";
            html = speech;
        }

        return {
            speech : speech,
            html : html,
            handler : handler
        }
    },

    kittyFinderHandler : function(message) {
        console.log("cat handler");
        var folder  = "/images/halcats/";
        var images = [
            "ear_cat.jpg",
            "lobster_cat.jpg",
            "mario_cat.jpg",
            "pikachu_cat.jpg"
        ];

        _.each(images, function(imgUrl, i) {

            var image = $("<img>")
                .width(100)
                .height(100)
                .addClass("hal-kittens")
                .attr("src", folder + imgUrl)
                .appendTo(message)
                .hide();

            _.delay(function() {
                image.fadeIn();
            }, i * 750);

        });

    }

});


var PageState = Backbone.Model.extend({

    defaults : {},

    addMessage : function(message) {
        this.get("messages").add(message);
        if(message.get("source")=="user") {
            this.trigger("user:message", message);
        } else {
            this.trigger("hal:message", message);
        }
    }

});

var SpeechFormView = Backbone.View.extend({

    el : "#speechForm",

    events : {
        "webkitspeechchange .speech-input" : "onInputSpeechChange",
        submit : "onSubmit"
    },

    initialize : function() {
        _.bindAll(this);
        this.state = this.options.state;
        this.ui = {};
        this.ui.input = this.$(".speech-input");
    },

    onInputSpeechChange : function(e) {
        this.$el.submit();
    },

    onSubmit : function(e) {
        var inputValue = this.ui.input.val();
        this.state.trigger("user:question", inputValue);
        this.ui.input.val("");
        return false;
    }

});

var HalView = Backbone.View.extend({

    el : "#hal",

    initialize : function() {
        _.bindAll(this);
        this.state = this.options.state;

    }

});

var BoardView = Backbone.View.extend({

    el : "#board",

    initialize : function() {
        _.bindAll(this);
        this.state = this.options.state;
        this.state.on("user:question", this.onUserQuestion, this);
        this.state.on("hal:thinking", this.onHalThinking, this);
        this.state.on("hal:reply", this.onHalReply);
        this.children = [];
        this.thinkingMessage = null;
    },

    onUserQuestion : function(question) {
        var messageView = new UserBoardMessageView({message : question, board : this});
        this.children.push(messageView);
        messageView.render();
    },

    onHalThinking : function() {
        var messageView = this.thinkingMessage = new HalBoardMessageView({board : this});
        this.children.push(messageView);
        messageView.render();
    },

    onHalReply : function(messageContent) {
        this.thinkingMessage.replyReceived(messageContent);
        this.thinkingMessage = null;
    }

});

var UserBoardMessageView = Backbone.View.extend({

    tagName : "div",
    className : "board-message user-message",

    initialize : function() {
        this.message = this.options.message;
        this.board = this.options.board;
    },

    render : function() {
        this.$el.html(this.message);

        this.$el.hide();
        this.$el.prependTo(this.board.$el);
        this.$el.slideDown("fast");
    }

});

var HalBoardMessageView = Backbone.View.extend({

    tagName : "div",
    className : "board-message hal-message",

    initialize : function() {
        this.board = this.options.board;
    },

    render : function() {
        var loader = $("<img>").attr("src", "/images/ajax-loader.gif");
        this.$el.append(loader);
        this.$el.prependTo(this.board.$el);
    },

    replyReceived : function(reply) {
        var replyHtml = reply.html;
        this.$el.html(replyHtml);
        if(reply.handler) {
            reply.handler(this.$el);
        }
    }

});

var PageController = Backbone.View.extend({

    el : "#container",

    initialize : function() {
        _.bindAll(this);
        this.state = new PageState();

        // hal
        var hal = this.hal = new Hal({state : this.state});

        // ui
        this.speechForm = new SpeechFormView({state : this.state});
        this.board = new BoardView({state : this.state});
        this.halView = new HalView({state : this.state});

    }

});


$(function() {

    var controller = new PageController();

});