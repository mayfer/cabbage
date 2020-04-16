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
            console.log(props.round)
            return html`
            <div class="flipbook-wrapper">
            ${JSON.stringify()}
                <div class="stack paper-stack-wrapper" >

                    ${this.createPaperStack(7)}
                </div>
            </div>
            `;
        }

        static css() {
            return `
                .flipbook-wrapper { margin: 60px;}
                .flipbook-sheet {position: absolute; box-shadow: inset 0 0 5px #000; background-color: #f5f3f3; width: 600px; height: 400px; }
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
            //console.log(sheet)
            this.setState({sheetIndex: index})
            
        }
    }
});

