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
            //css.load("round-overview", RoundOverview.css())
        }

        render(props, s) {
            return html`
            <div class="flipbook-wrapper">
                <h3>This round is closed.</h3>
                <div class="stack paper-stack-wrapper overview" >
                    ${this.props.round.turns.map((turn,i) => {
                        return this.createSheet(turn, i, this.props.round.turns.length)
                    })}
                </div>
            </div>
            `;
        }

        static css() {
            return css.add_parents('.flipbook-wrapper ', `
                { margin: 60px 0;}
                .flipbook-sheet { margin-top: 6px; margin-bottom: 40px; display: flex; justify-content: center; align-items: center;}
                .turn-image { border-radius: 5px;  max-width: 600px; box-shadow: inset 0 0 5px #000; background-color: #f5f3f3;   }
                .turn-prompt-text { border-radius: 5px;  font-size: 25px; text-align: center; width: 100%; background: rgba(255, 255, 255, 0.3); padding: 20px; margin: 5px 0; }
                .stack.paper-stack-wrapper.overview { width: 600px;}
                .handle-text { font-weight: bold; line-height: 25px; font-size: 17px;}
                .turn-timestamp { float: right; color: #666; font-size: 16px;}

            `);
        }

        createSheet(turn, i, denom) {
            return html `
                <div class="handle-wrapper">
                    ${i + 1}/${denom + " -     By"}
                    <span class="handle-text"> 
                      ${" " + turn.username + " "} 
                    </span>
                    <span class="turn-timestamp"> 
                     ${Common.timeSince(turn.timestamp)} ago
                    </span>
                </div>
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

