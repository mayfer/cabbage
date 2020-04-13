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

        componentDidMount(){
            this.input.focus()
        }

        render(props, s) {
            const { channel } = props;
            return html`
            <div class="instruction-tile">
                <h1>Start a new round</h1>
                <div class="instruction-tile-inner">
                    <div class="instruction-title">
                        <div id="rounds-input-wrapper" >
                            Set a minimum number of rounds
                            <input id="rounds-count-input" type="Number" min="2" defaultValue="5" placeholder="5" ref=${r => this.input=r} 
                                onInput=${e => this.setState({count: e.target.value})} />
                        </div>
                        <p>Choose one:</p>
                    </div>
                    <div class="prompt-start-buttons">
                        <a 
                            href="/lobby/${channel.slug}/round/new/text" 
                            class="button-wrapper"
                            onClick=${e => Router.hijack(e)}
                        >
                            <div id="start-writing-button" class="prompt-start-button">
                                Write something for a friend to draw
                                <p class="eg-text">
                                    e.g. despair, ankles, beef stew bath
                                </p>
                            </div>
                        </a>
                        <a 
                            href="/lobby/${channel.slug}/round/new/draw" 
                            onClick=${e => Router.hijack(e)}
                            class="button-wrapper"
                        >
                            <div id="start-drawing-button" class="prompt-start-button">
                                Draw something for a friend to caption 
                            </div>
                        </a>
                    </div>
                </div>
            </div>
            `;
        }

        static css() {
            return `
                .instruction-tile { width: 600px; margin: 40px auto; display: block; text-align: center; }
                .instruction-tile-inner { width: 600px; height: 400px; border-radius: 5px; background: #fff; padding: 15px; }
                .button-wrapper { text-decoration: none; color: #000; }
                .prompt-start-buttons { display: flex; justify-content : space-around; }
                .prompt-start-button { width: 250px; height: 250px; font-size: medium; cursor: pointer; display: table-cell; vertical-align: middle; padding: 10px; border-radius: 5px; font-size: 25px; }
                .instruction-title { }
                #start-drawing-button {background-color: #f9d49c; opacity: 0.9;}
                #start-writing-button {background-color: #76ba8d; opacity: 0.9;}
                .eg-text { color: ##383636; font-size: small;}
                #start-drawing-button:hover { opacity: 1; }
                #start-drawing-button:active { position: relative; top: 2px; left: 2px; border-radius: 5px;}
                #start-drawing-button:focus { outline:0;}
                #start-writing-button:hover { opacity: 1; }
                #start-writing-button:active { position: relative; top: 2px; left: 2px; border-radius: 5px;}
                #start-writing-button:focus { outline:0;}
                #rounds-count-input { margin-left: 10px; text-align: center; border: 1px solid #000; width: 50px;}
                #rounds-count-input:focus { outline:none !important; outline-width: 0 !important; box-shadow: none; -moz-box-shadow: none; -webkit-box-shadow: none;}
                #rounds-input-wrapper { margin-top: 10px;}

            `
        }
    }
});

