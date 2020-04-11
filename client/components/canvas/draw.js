

define(function(require, exports) {

    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');


    class Draw extends Component {
        constructor(props) {
            super();
            let channel = props.channel;
            this.state = {
            };
            css.load("draw", Draw.css())
        }

        componentDidMount() {
            /*                // create a drawing area inside an element
                var canvas = new drawingCanvas($('#draw'));

                // log the drawn image's data when button is clicked
                $('#save').click(function(e) {
                    var imagedata = canvas.getImage();
                    console.log(imagedata);
                });
            */

            require(['./mousetrap', './draw'], function(mousetrap, draw) {

            });
        }

        render(props, s) {
            const { channel } = props;
            return html`
                <div class='drawing-container'>
                    <div id='draw'> </div>
                    <button id='save'>Save</button>
                </div>

            `
        }

        static css() {
            return `
                .drawing-container { width: 600px; margin: 0 auto; padding: 50px; text-align: center; }
                #draw { width: 600px; height: 400px; border: 3px solid #000; background: #fff; }
                #save { margin: 10px; font-size: 20px; line-height: 25px; }
            `;
        }

    }

    return Draw;
})



