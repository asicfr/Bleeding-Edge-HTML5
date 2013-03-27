

Kitty.LoginLayer = Backbone.View.extend({

    el : "#loginLayer",

    events : {
        "click .submitInput" : "onSubmitClick"
    },

    initialize : function() {
        _.bindAll(this);
    },

    open : function() {
        console.log("opening login layer !");

        $("#loginLayer").modal({
            overlayId: 'login-overlay',
            containerId: 'login-container',
            closeHTML: null,
            minHeight: 80,
            opacity: 65,
            position: ['0'],
            close: false,
            onOpen: this.onModalOpen,
            onClose: this.onModalClose
        });

    },

    onSubmitClick : function() {
        var email = this.$(".emailInput").val();
        if(/\S+@\S+\.\S+/.test(email)) {
            window.game.logIn(email);
            $.modal.close();
        } else {
            var loginBox = $("#login-container");
            for (var i = 0; i < 6; i++) {
                var leftAnim = (i % 2 == 0 ? "+" : "-") + "=20";
                loginBox.animate({left : leftAnim}, 50);
            }
        }
    },

    onModalOpen: function (d) {
        // var self = this;
        this.container = d.container;

        $(d.wrap).css('overflow', 'hidden');

        var layer = $("#loginLayer", d.container);
        var title = layer.find(".login-title");
        var content = layer.find(".login-content");


        this.startTypingText();

        test = content;

        d.overlay.fadeIn('slow', function () {
            layer.show();
            title.show();
            d.container.slideDown('slow', function () {
                d.container.css("height", "auto");
            });
        })
    },

    /**
     * This is ugly, but I didnt want to write clean uzinagaz just for fancy effect.
     */
    startTypingText : function() {

        var loginText = [
            "function LoginPage() {",
            "    // Welcome to Devoxx 2013 Space Chatons Speak !",
            "    // To continue, we just need your email to catch your gravatar image",
            "    $(\"#login\").append(\"",
            "        <form action='/' method='post'>",
            "            <input type='text' name='email' value='_email_'>",
            "            <input type='submit' value='_submit_'>",
            "        </form>",
            "    \");",
            "};"

        ].join("\n");

        var pre = this.$("pre");

        var charDelay = 5;

        var index = 0;
        var inSpecial = false;
        var specialKeyword = null;
        var specialElement = null;

        var onAnimationComplete = function() {

        };

        var animationIterator = function() {
            if(index>=loginText.length) {
                onAnimationComplete();
                return;
            }

            if(inSpecial) {
                if(specialKeyword=="email") {
                    if(specialElement==null) {
                        specialElement = $("<input type='text'>").addClass("emailInput").width(10);
                        pre.append(specialElement);
                    } else {
                        specialElement.width(specialElement.width() + 10);
                        if(specialElement.width() > 120) {
                            inSpecial = false;
                            specialElement = null;
                        }
                    }
                } else if(specialKeyword=="submit") {
                    if(specialElement==null) {
                        specialElement = $("<input type='submit' value=''>").addClass("submitInput");
                        pre.append(specialElement);
                    } else {
                        var value = "Submit";

                        var submitValueLength = specialElement.attr("value").length;
                        specialElement.attr("value", value.substr(0, submitValueLength+1));

                        if(specialElement.attr("value").length>=value.length) {
                            inSpecial = false;
                            specialElement = null;
                        }
                    }
                }
            } else {
                var nextChar = loginText[index];
                if(nextChar=="_") {
                    var nextIndex = loginText.substr(index+1).indexOf("_");
                    specialKeyword = loginText.substr(index + 1, nextIndex);
                    inSpecial = true;
                    index += nextIndex + 2;
                } else {
                    pre.append(_.escape(nextChar));
                    index++;
                }
            }


            _.delay(animationIterator, charDelay);

        };

        // start the iterator
        _.delay(animationIterator, charDelay);
    },

    onModalClose: function (d) {
        d.container.animate({top:"-" + (d.container.height() + 20)}, 500, function () {
            $.modal.close();
        });
    }

});