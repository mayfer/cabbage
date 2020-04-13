define(function(require, exports) {
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const { fonts } = require("components/theme");
    const Router = require("components/router");


    return class InstructionTile extends Component {
        constructor(props) {
            super();
            this.state = {};
            css.load("instruction-tile", InstructionTile.css())
        }

        render(props, s) {
            return html`
            <div class="instruction-tile">
                <div class="instruction-tile-inner">
                    <div class="instruction-title">
                        Everyone starts by creating a prompt 

                        <p>Choose one:</p>
                    </div>
                    <div class="prompt-start-buttons">
                        <span class="button-wrapper">
                            <button id="start-writing-button" class="prompt-start-button">
                                Write something for a friend to draw
                                <p class="eg-text">
                                    e.g. despair, ankles, beef stew bath
                                </p>
                            </button>
                        </span>
                        <span class="button-wrapper">
                            <button id="start-drawing-button" class="prompt-start-button">
                                Draw something for a friend to caption 
                            </button>
                        </span>
                    </div>
                </div>
            </div>
            `;
        }

        static css() {
            return `
                .instruction-tile { width: 600px; margin: 0 auto; padding: 40px 50px 48px 50px; display: block; }
                .instruction-tile-inner { width: 600px; height: 400px; border: 3px solid #000; background: #fff; }
                .prompt-start-buttons { display: flex; justify-content : space-around}
                .prompt-start-button { width: 250px; height: 250px; font-size: medium;}
                .instruction-title { margin-top: 25px; margin-bottom: 20px}
                #start-drawing-button {background-color: #f9d49c; opacity: 0.9;}
                #start-writing-button {background-color: #76ba8d; opacity: 0.9;}
                .eg-text { color: ##383636; font-size: small;}
                #start-drawing-button:hover { opacity: 1; border: 2px solid #fff;}
                #start-drawing-button:active { position: relative; top: 2px; left: 2px; border: 2px solid #fff;}
                #start-drawing-button:focus { outline:0;}
                #start-writing-button:hover { opacity: 1; border: 2px solid #fff;}
                #start-writing-button:active { position: relative; top: 2px; left: 2px; border: 2px solid #fff;}
                #start-writing-button:focus { outline:0;}

            `
        }
    }
});

