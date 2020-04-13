define(function(require, exports) {
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const { fonts } = require("components/theme");
    const Router = require("components/router");


    return class Lobby extends Component {
        constructor(props) {
            super();
            this.state = {};
            css.load("rounds", Lobby.css())
        }

        // availableRounds = getAvailableRounds.map((i) => <div> i.name</div>)

        render(props, s) {
            const { channel } = props;
            var dummyData = [{name: "murat", count: 3, lastTime: Date.now()}, {name: "adele", count: 2, lastTime: Date.now()}, {name: "theo", count: 7, lastTime: Date.now() }];
            return html`
            <div id="lobby">
                <div class="rounds-content">
                    <div class="available-rounds-wrapper">
                        <div class="round-section-title">
                            Available Rounds
                        </div>
                        <div class="rounds">
                            
                            <div class="stack" >
                                <a 
                                    href='/lobby/${channel}/round/new/'
                                    onClick=${e => { e.preventDefault(); Router.navigate(`/lobby/${channel}/round/new/`);}}
                                >
                                    <button>Add Round +</button>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="complete-rounds-wrapper">
                        <div class="round-section-title">
                            Complete Rounds
                        </div>
                        <div class="rounds">
                            ${dummyData.map(d => html`
                                <a href='/'>
                                    <div class="stack paper-stack-wrapper" >
                                        ${this.createPaperStack(d.count)}
                                        ${this.timeSince(d.lastTime)}
                                    </div>
                                </a>
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
                #lobby { width: 100%; margin: 0 auto; display: block; }
                .stack-image { width: 100px}
                .round-section-title { margin-top: 50px; margin-bottom: 15px;}
                .footer-image { width: 100%; }
                .stack { height: 100px; width: 100px;}
                .stack-image { width: 100%; position: absolute; }
                .stack-count {postion: absolute}
                .paper-sheet {position: absolute; box-shadow: inset 0 0 10px #000; background-color: #f5f3f3; width: 50px; height: 50px;}
                .paper-stack-wrapper { position: relative; width: 100px; height: 100px;}

            `
        }

        timeSince(date) {
            var seconds = Math.floor((new Date() - date) / 1000);
            var interval = Math.floor(seconds / 31536000);

            if (interval > 1) {
            return interval + " years";
            }
            interval = Math.floor(seconds / 2592000);
            if (interval > 1) {
            return interval + " months";
            }
            interval = Math.floor(seconds / 86400);
            if (interval > 1) {
            return interval + " days";
            }
            interval = Math.floor(seconds / 3600);
            if (interval > 1) {
            return interval + " hours";
            }
            interval = Math.floor(seconds / 60);
            if (interval > 1) {
            return interval + " minutes";
            }
            return Math.floor(seconds) + " seconds";
        }

        createPaperStack(count) {
            var countArray = Array(count).fill(null)
            return countArray.map((d, i) => {
                return html `
                <div class="paper-sheet" style="left:${i * 2}px; bottom:${i * 3}px">
                </div>`
            })
        }
    }
});

