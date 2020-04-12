define(function(require, exports) {
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const { fonts } = require("components/theme");
    const Router = require("components/router");


    return class Rounds extends Component {
        constructor(props) {
            super();
            this.state = {};
            css.load("rounds", Rounds.css())
        }

        // availableRounds = getAvailableRounds.map((i) => <div> i.name</div>)

        render(props, s) {
            var dummyData = [{name: "murat", count: 3}, {name: "adele", count: 2}, {name: "theo", count: 7 }];
            return html`
            <div class="rounds-wrapper">
                <div class="rounds-content">
                    <div class="available-rounds-wrapper">
                        <div class="round-section-title">
                            Available Rounds
                        </div>
                        <div class="rounds">
                            ${dummyData.map(d => html`
                                <div class="stack" >
                                    ${d.name}
                                    <div class="paper-sheet"> </div>
                                    <div class="stack-count" > 
                                        ${d.count}
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                    <div class="complete-rounds-wrapper">
                        <div class="round-section-title">
                            Complete Rounds
                        </div>
                        <div class="rounds">
                            ${dummyData.map(d => html`
                                <div class="stack" >
                                    ${d.name}
                                    <img class="stack-image" src="/client/assets/stack1.svg" />
                                </div>
                            `)}
                        </div>
                    </div>
                    <div class="footer-image-wrapper">
                      <img class="footer-image" src="/client/assets/lobby_slug.svg" />
                    </div>
                </div>
            </div>
            `;
        }

        static css() {
            return `
                .rounds-wrapper { width: 600px; margin: 0 auto; padding: 40px 50px 48px 50px; display: block; }
                .rounds-content { width: 600px; height: 400px; }
                .stack-image { width: 100px}
                .round-section-title { margin-top: 50px; margin-bottom: 15px;}
                .footer-image { }
                .stack { position: relative; text-align:center; height: 67px; width: 100px;}
                .stack-image { width: 100%; position: absolute; }
                .stack-count {postion: absolute}
                .paper-sheet {background-color: grey; width: 100%}

            `
        }

    }
});

