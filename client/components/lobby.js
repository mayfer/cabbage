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
            var dummyData = [
                {name: "murat", count: 32, lastTime: Date.now(), type: 'caption'}, 
                {name: "adele", count: 2, lastTime: Date.now(), type: 'drawing'}, 
                {name: "theo", count: 7, lastTime: Date.now(), type: 'caption' }
            ];
            return html`
            <div id="lobby">
                <h1>Lobby</h1>
                <div class="round-section-title">Send the URL of this page to invite others.</div>
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
                            Available rounds
                        </div>
                        <div class="rounds">
                            <a 
                                href='/lobby/${channel.slug}/round/new/'
                                onClick=${e => { e.preventDefault(); Router.navigate(`/lobby/${channel.slug}/round/new/`);}}
                            >
                                <span id="add-round-button" >+ Start a new round</span>
                            </a>
                            <div class="rounds">
                                ${dummyData.map(d => html`
                                    <div class="single-round-wrapper">
                                        <a class="round-link" href='/'>
                                            <div class="stack paper-stack-wrapper" >
                                                ${this.createPaperStack(d.count)}
                                            </div>
                                            <div class="round-description" >
                                                Last <strong>${d.type}</strong> by <strong>${d.name}</strong>
                                                <div class='time'>${this.timeSince(d.lastTime-Math.abs(Math.random()*1000000))} ago</div>
                                            </div>
                                            <div class='since'>Round started ${this.timeSince(d.lastTime-Math.abs(Math.random()*1000000000))} ago</div>
                                        </a>
                                    </div>
                                `)}
                            </div>
                        </div>
                    </div>
                    <div class="complete-rounds-wrapper">
                        <div class="round-section-title">
                            Completed rounds
                        </div>
                        <div class="rounds">
                            ${dummyData.map(d => html`
                                <div class="single-round-wrapper">
                                    <a class="round-link" href='/'>
                                        <div class="stack paper-stack-wrapper" >
                                            ${this.createPaperStack(d.count)}
                                        </div>
                                        <div class="round-description" >
                                            Last <strong>${d.type}</strong> by <strong>${d.name}</strong>
                                            <div class='time'>${this.timeSince(d.lastTime-Math.abs(Math.random()*1000000))} ago</div>
                                        </div>
                                        <div class='since'>Round started ${this.timeSince(d.lastTime-Math.abs(Math.random()*1000000000))} ago</div>
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
                #lobby {  display: block; }

                #lobby .copy-link { font-size: 14px; background: #ccc; cursor: pointer; height: 30px; line-height: 30px; padding: 0 10px; display: inline-block; vertical-align:  middle; color: #000; }
                #lobby .copy-link:hover { background: #999; color: #000; }
                #lobby .copy-link:active { background: #000; color: #fff; }
                #copied-text { color: #666; margin-left: 15px; font-size: small;}

                .stack-image { width: 50px; }
                .round-section-title { margin-top: 30px; margin-bottom: 15px; color: black; font-size: large;}
                .footer-image { width: 100%; }
                .stack-image { width: 100%; position: absolute; }
                .stack-count {postion: absolute ;}
                .paper-sheet {position: absolute; box-shadow: inset 0 0 5px #000; background-color: #f5f3f3; width: 50px; height: 50px; }
                .paper-stack-wrapper { display: inline-block; position: relative; width: 50px; height: 50px; margin-right: 30px; }
                .count-number { text-align: center; position: absolute; height: 100%; width: 100%; top: 50%; transform: translateY(-25%); }

                .round-link, .round-link:visited { color: #000; border-radius: 5px; margin-top: 12px; padding: 10px; background-color: rgba(130, 120, 120, 0.1); line-height: 25px; font-size: 17px; cursor: pointer; display: block; text-decoration: none; }
                .round-link .time { color: #666; }
                .round-link .since { color: #666; float: right; font-size: 16px; }
                .round-link:hover { background: #0f0; }

            
                .round-description { display: inline-block; vertical-align: top; }
                #add-round-button { background: #efe; color: #040; line-height: 25px; padding: 0 10px; display: inline-block; }
                #add-round-button:hover { background: #707; color: #fff; }

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
            var countArray = Array(Math.min(count, 6)).fill(null)
            return countArray.map((d, i) => {
                return html `
                <div class="paper-sheet" style="left:${i * 2}px; top:${i * 1}px">
                    <div class="count-number">
                        ${count}
                    </div>
                </div>`
            })
        }
    }
});

