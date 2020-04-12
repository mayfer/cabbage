

define(function(require, exports) {

    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');


    class Draw extends Component {
        constructor(props) {
            super();
            let channel = props.channel;
            this.state = {
            };
            //css.load("draw", Draw.css())
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

            require(['./mousetrap', './drawlib'], (mousetrap, drawlib) => {
                if(this.draw_area) {
                    this.canvas = new drawlib.drawingCanvas(this.draw_area);
                }
            });
        }

        componentWillUnmount() {
            if(this.canvas) {
                this.canvas.removeEvents();
            }
        }

        componentShouldUpdate(){
            return false;
        }

        submit(){
            alert('submit!')
        }

        render(props, s) {
            const { channel } = props;
            return html`
                <div class='drawing-container'>
                    <div class='draw-area' ref=${r => this.draw_area=r}> </div>
                    <div class="button-grid">
                        <div id='undo-redo-container'>
                            <button id='undoStrokeButton' class='control-button'>Undo</button>
                            <button id='redoStrokeButton' class='control-button'>Redo</button>
                        </div>
                        <button id='prompt-submit' onClick=${this.submit}>Submit</button>
                    </div>
                </div>

            `
        }

        static css() {
            return `
                .drawing-container { width: 100%; display: block; }
                .draw-area { width: 100%; height: 400px; border: 3px solid #000; background: #fff; box-sizing: border-box;}
                .draw-area:hover { cursor: url("/client/assets/pencil.svg") 0 29, auto; }
                #undo-redo-container { height: 100%; display: flex; align-items: flex-start;}
                .control-button { margin: 0 10px 0 0; font-size: 15px; line-height: 20px; max-width: 55px; }
            `;
        }

    }

    return Draw;
})



