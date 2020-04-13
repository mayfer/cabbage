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
            var dummyData = [{name: "murat", count: 3}, {name: "adele", count: 2}, {name: "theo", count: 7 }];
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
                            
                            ${dummyData.map(d => html`
                                <a href='/'>
                                    <div class="stack" >
                                        ${d.name}
                                        <div class="paper-sheet"> </div>
                                        <div class="stack-count" > 
                                            ${d.count}
                                        </div>
                                    </div>
                                </a>
                            `)}
                            
                            <div class="stack" >
                                <a 
                                    href='/lobby/${channel.slug}/round/new/'
                                    onClick=${e => { e.preventDefault(); Router.navigate(`/lobby/${channel.slug}/round/new/`);}}
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
                                    <div class="stack" >
                                        ${d.name}
                                        <img class="stack-image" src="/client/assets/stack1.svg" />
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
                #lobby {  display: block; padding: 50px 0; }

                #lobby .copy-link { font-size: 14px; background: #ccc; cursor: pointer; height: 30px; line-height: 30px; padding: 0 10px; display: inline-block; vertical-align:  middle; color: #333; }
                #lobby .copy-link:hover { background: #999; color: #000; }
                #lobby .copy-link:active { background: #000; color: #fff; }
                #copied-text { color: #666; margin-left: 15px; font-size: small;}

                .stack-image { width: 100px}
                .round-section-title { margin-top: 50px; margin-bottom: 15px;}
                .footer-image { width: 100%; }
                .stack { position: relative; height: 67px; width: 100px;}
                .stack-image { width: 100%; position: absolute; }
                .stack-count {postion: absolute}
                .paper-sheet {background-color: grey; width: 100%}

            `
        }

    }
});

