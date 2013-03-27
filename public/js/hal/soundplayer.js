
function HalVoicePlayer() {



    /* Audio Context */

    var context_ = new (window.AudioContext || window.webkitAudioContext)();
    




    const MIX_TO_MONO = false;
    const NUM_SAMPLES = 2048;
    var self_ = this;
    var source_ = null;
    var analyser_ = null;
    var reqId_ = null;

    var gradient = $('#hal .inner .inner').get(0);
    var canvas = document.getElementById('fft');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; //rgba(68,0,3,0.2)


    this.playing = false;

    var processAudio_ = function(time) {

        var freqByteData = new Uint8Array(analyser_.frequencyBinCount);

        analyser_.getByteFrequencyData(freqByteData);

        var percent = Math.min((util.max(freqByteData) / 150) * 100, 105);
        if (!self_.playing) {
            percent = 100;
        }
        gradient.style.backgroundSize = '76% 41%, 55% 100%, ' + percent + '%, ' + percent + '%';

        self_.renderFFT('canvas', freqByteData);
    };

    this.renderFFT = function(format, freqByteData) {
        if (format == 'canvas') {
            const SPACER_WIDTH = 5;
            const BAR_WIDTH = 5;
            const numBars = Math.round(canvas.width / SPACER_WIDTH);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw rectangle for each frequency bin.
            var y = (canvas.height / 2) + 3;
            for (var i = 0; i < numBars; ++i) {
                var magnitude = freqByteData[i];
                var height = magnitude / (canvas.height / 50);
                ctx.fillRect(i * SPACER_WIDTH, y, BAR_WIDTH, -height);
                ctx.fillRect(i * SPACER_WIDTH, y, BAR_WIDTH, height);
            }
        }
    };

    this.initAudio = function(arrayBuffer) {

        source_ = context_.createBufferSource();
        source_.looping = false;

        // Use async decoder if it is available (M14).
        if (context_.decodeAudioData) {
            context_.decodeAudioData(arrayBuffer, function(buffer) {
                source_.buffer = buffer;
            }, function(e) {
                console.log(e);
            });
        } else {
            source_.buffer = context_.createBuffer(arrayBuffer, MIX_TO_MONO /*mixToMono*/);
        }
    };




    /* Play ! */

    this.play = function() {
        analyser_ = context_.createAnalyser();

        // Connect the processing graph: source -> analyser -> destination
        source_.connect(analyser_);
        analyser_.connect(context_.destination);

        source_.noteOn(0);
        this.playing = true;

        (function callback(time) {
            processAudio_(time);
            reqId_ = window.webkitRequestAnimationFrame(callback);
        })();
    };






    this.stop = function() {
        source_.disconnect(0);
        analyser_.disconnect(0);
        this.playing = false;
        window.webkitCancelRequestAnimationFrame(reqId_);
    };

    this.speak = function(speakText) {

        return $.when(generateSoundBuffer(speakText)).then(function(buffer) {

            console.log("hal speaking : ", speakText, buffer);
            self_.initAudio(buffer);
            self_.play();
        });
    };
}

$(function() {

    console.log("soundplayer -> init");

    window.util = window.url || {};

    util.max = function(array) {
        var max = array[0];
        var len = array.length;
        for (var i = 0; i < len; ++i) {
            if (array[i] > max) {
                max = array[i];
            }
        }
        return max;
    }

    util.average = function(array) {
        var sum = 0;
        var len = array.length;
        for (var i = 0; i < len; ++i) {
            sum += array[i];
        }
        return sum / len;
    }

    window.halVoice = new HalVoicePlayer();
})