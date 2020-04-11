

define(function(require, exports) {
    const mousetrap = require('mousetrap');
    const draw = require('draw');

    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');


    class Draw extends Component {
        constructor(props) {
            super();
            let channel = props.channel;
            this.state = {
            };
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
        }

        render(props, s) {
            const { channel } = props;
            return html`
                <div class='container'>
                    <div id='draw'> </div>
                    <button id='save'>Save</button>
                </div>

            `
        }

        static css() {
            return `
                .bla {}
            `;
        }

    }

    return Draw;
})



