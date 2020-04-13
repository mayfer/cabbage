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
        }

        render(props, s) {
            const { channel } = props;
            var dummyData = [{name: "murat", count: 3, lastTime: Date.now()}, {name: "adele", count: 2, lastTime: Date.now()}, {name: "theo", count: 7, lastTime: Date.now() }];
            return html`
            <div id="lobby">

                Send the URL of this page to invite others.<br />
                <a class='copy-link' onClick=${e => {
                    Common.copy_link(e);
                    this.setState({copied: true})
                    setTimeout( () => {
                        this.setState({copied: false})
                    }, 2000)
                }}>
                    Copy sharable link to this game
                </a>
                ${s.copied ? html`
                    <span id="copied-text" >
                        Copied ${window.location.href}
                    </span>` : ''
                }

                <div class="rounds-content">
                    <div class="available-rounds-wrapper">
                        <div class="round-section-title">
                            Available Rounds
                        </div>
                        <div class="rounds">
                            <a 
                                href='/lobby/${channel.slug}/round/new/'
                                onClick=${e => { e.preventDefault(); Router.navigate(`/lobby/${channel.slug}/round/new/`);}}
                            >
                                <button id="add-round-button" >Add Round +</button>
                            </a>
                            <div class="rounds">
                                ${dummyData.map(d => html`
                                    <div class="single-round-wrapper">
                                        <a class="round-link" href='/'>
                                            <div class="stack paper-stack-wrapper" >
                                                ${this.createPaperStack(d.count)}
                                            </div>
                                            <div class="round-description" >
                                                Last turn: ${d.name}, ${this.timeSince(d.lastTime)} ago
                                            </div>
                                        </a>
                                    </div>
                                `)}
                            </div>
                        </div>
                    </div>
                    <div class="complete-rounds-wrapper">
                        <div class="round-section-title">
                            Complete Rounds
                        </div>
                        <div class="rounds">
                            ${dummyData.map(d => html`
                                <div class="single-round-wrapper">
                                    <a class="round-link" href='/'>
                                        <div class="stack paper-stack-wrapper" >
                                            ${this.createPaperStack(d.count)}
                                        </div>
                                        <div class="round-description" >
                                            Last turn: ${d.name}, ${this.timeSince(d.lastTime)} ago
                                        </div>
                                    </a>
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
                #lobby {  display: block; padding: 50px 0; }

                #lobby .copy-link { font-size: 14px; background: #ccc; cursor: pointer; height: 30px; line-height: 30px; padding: 0 10px; display: inline-block; vertical-align:  middle; color: #333; }
                #lobby .copy-link:hover { background: #999; color: #000; }
                #lobby .copy-link:active { background: #000; color: #fff; }
                #copied-text { color: #666; margin-left: 15px; font-size: small;}

                .stack-image { width: 100px}
                .round-section-title { margin-top: 70px; margin-bottom: 15px; color: black; font-size: large;}
                .footer-image { width: 100%; }
                .stack-image { width: 100%; position: absolute; }
                .stack-count {postion: absolute ;}
                .paper-sheet {position: absolute; box-shadow: inset 0 0 5px #000; background-color: #f5f3f3; width: 50px; height: 50px; }
                .paper-stack-wrapper { position: relative; width: 100px; height: 50px; }
                .count-number { position: absolute; height: 100%; width: 100%; top: 50%; transform: translateY(-25%); }
                .single-round-wrapper { display: flex; flex-direction: row; margin-top: 12px; padding: 10px; background-color: rgba(130, 120, 120, 0.1);}
                .round-link { display: inline-flex; text-decoration: none; }
                .round-link:visited { color: black; }
                .round-description { transform: translateY(68%); }
                #add-round-button { margin-bottom: 20px; }

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
                <div class="paper-sheet" style="left:${i * 2}px; top:${i * 1}px">
                    ${(i + 1) == count ? html `
                        <div class="count-number">
                            ${i + 1}
                        </div>
                        `: ""}
                </div>`
            })
        }
    }
});

