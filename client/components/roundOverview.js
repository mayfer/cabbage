define(function(require, exports) {
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const { fonts } = require("components/theme");
    const Router = require("components/router");


    return class RoundOverview extends Component {
        constructor(props) {
            super();
            this.state = {};
            css.load("round-overview", RoundOverview.css())
        }

        render(props, s) {
            return html`
            <div class="flipbook-wrapper">
            ${JSON.stringify()}
                <div class="stack paper-stack-wrapper" >
                    ${this.props.round.turns.map((turn,i) => {
                        return this.createSheet(turn, i)
                    })}
                </div>
            </div>
            `;
        }

        static css() {
            return `
                .flipbook-wrapper { margin: 60px;}
                .flipbook-sheet { box-shadow: inset 0 0 5px #000; background-color: #f5f3f3; width: 600px; height: 400px; margin-top: 20px; margin-bottom: 20px; display: flex; justify-content: center; align-items: center;}
                .turn-image { max-width: 600px; }
                .turn-prompt-text { font-size: larger; }
            `
        }

        createSheet(turn, i) {
            return html `
                <div class="flipbook-sheet">
                    ${turn.type == "drawing" ? html`
                        <img class="turn-image" src="${turn.contents}" />
                    ` : html `
                        <div class="turn-prompt-text"> 
                            ${turn.contents}
                        </div>
                    `
                }
                </div>
            `
        }

        createPaperStack(count) {
            var countArray = Array(count).fill(null)
            return countArray.map((d, i) => {
                return html `
                <div class="flipbook-sheet" onClick=${e => { this.flipSheet(count - i)}} style="left:${i * 2}px; top:${i * 1}px">
                    ${count - i}
                </div>`
            })
        }

        flipSheet(index) {
            this.setState({sheetIndex: index})
        }
    }
});

