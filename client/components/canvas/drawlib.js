define(function(require, exports) {
    const $ = require('jquery');

    function setCanvasSize(canvas_jq, width, height) {
        canvas_jq.css('width', width);
        canvas_jq.css('height', height);
        canvas_jq.attr('width', width);
        canvas_jq.attr('height', height);
        var canvas = canvas_jq.get(0);
        var context = canvas.getContext("2d");
        // make the h/w accessible from context obj as well
        context.width = width;
        context.height = height;

        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
        var ratio = devicePixelRatio / backingStoreRatio;

        // upscale the canvas if the two ratios don't match
        if(devicePixelRatio !== backingStoreRatio) {
            var oldWidth = canvas.width;
            var oldHeight = canvas.height;

            canvas.width = oldWidth * ratio;
            canvas.height = oldHeight * ratio;

            canvas.style.width = oldWidth + 'px';
            canvas.style.height = oldHeight + 'px';

            context.scale(ratio, ratio);
            context.scale_ratio = ratio;
        }

    }
        
    function Canvas(jq_elem) {
        // create a canvas inside another element
        // and set the height&width to fill the element
        var canvas_jq = $('<canvas>');
        var width = jq_elem.innerWidth();
        var height = jq_elem.innerHeight();
        
        setCanvasSize(canvas_jq, width, height);

        canvas_jq.appendTo(jq_elem);
        return canvas_jq;
    }

    function drawingCanvas(raw_elem) {
        var jq_elem = $(raw_elem);
        var canvas_jq = Canvas(jq_elem).addClass('drawing-canvas');
        var canvas = canvas_jq.get(0);
        var ctx = canvas.getContext("2d");
        var that = this;
        var draw = false;
        var prev_position = null;

        var history = [];
        var history_position = 0;

        this.init = function(color) {
            this.resetLineHistory();
            ctx.lineWidth = 2;
            ctx.lineCap = "round";

            if(color) {
                ctx.strokeStyle = color;
            } else {
                ctx.strokeStyle = '#000000';
            }

            $(document).on("mousemove", function(e) {
                if(draw == true) {
                    var current_position = that.getCursorPosition(e);
                    that.drawLine(prev_position, current_position);
                    prev_position = current_position;
                }
            });
            $(document).on("mouseup", function() {
                that.stopDrawing();
            });

            canvas_jq.mousedown(function(e) {
                e.preventDefault();
                that.startDrawing(that.getCursorPosition(e));
            }).mouseup(function(e){
                that.snapshot();
            });

            $('#undoStrokeButton').click(function(e){
                that.undo();
            });

            $('#undoStrokeButton').click(function(e){
                that.redo();
            });

            // Mousetrap.bind(['command+z', 'ctrl+z'], function(e) {
            //     that.undo();
            // });
            // Mousetrap.bind(['command+shift+z', 'ctrl+shift+z'], function(e) {
            //     that.redo();
            // });
        }

        this.removeEvents = function() {
            $(document).off("mousemove");
            $(document).off("mouseup");
        }

        this.drawLine = function(prev_position, current_position) {
            ctx.beginPath();
            ctx.moveTo(prev_position.x, prev_position.y);
            ctx.lineTo(current_position.x, current_position.y);
            ctx.stroke();
        }

        this.startDrawing = function(pos) {
            draw = true;
            prev_position = pos;
        }
        this.stopDrawing = function() {
            draw = false;
            this.resetLineHistory();
        }
        this.snapshot = function () {
            history[history_position++] = canvas.toDataURL();
        };

        this.redo = function() {
            
            if(history.length > history_position) {
                ctx.clearRect(0, 0, ctx.width, ctx.height);

                var data = history[history_position++];
                var img = new Image;
                img.src = data;
                ctx.drawImage(img, 0, 0, img.width/ctx.scale_ratio, img.height/ctx.scale_ratio);
            }
            
        }
        this.undo = function() {
            if(history.length >= history_position && 0 < history_position) {
                ctx.clearRect(0, 0, ctx.width, ctx.height);

                var snap = history[--history_position-1];

                if(snap) {
                    var data = snap;
                    var img = new Image;
                    img.src = data;
                    ctx.drawImage(img, 0, 0, img.width/ctx.scale_ratio, img.height/ctx.scale_ratio);
                }

            }
            
        }
        this.resetLineHistory = function() {
            prev_position = { x: null, y: null };
        }
        this.getCursorPosition = function(e) {
            var x = e.pageX - canvas_jq.offset().left
            var y = e.pageY - canvas_jq.offset().top
            if(x < 0) x = 0;
            if(y < 0) y = 0;
            return {x: x, y: y};
        }

        this.getImage = function() {
            return canvas.toDataURL();
        }

        this.init();
        return this;
    }

    return { drawingCanvas };

});