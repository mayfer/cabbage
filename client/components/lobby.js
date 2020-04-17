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

        componentDidMount() {

        }

        render(props, s) {
            const { channel } = props;
            const completed_rounds = channel.rounds.filter(r => r.status == 'closed');
            const available_rounds = channel.rounds.filter(r => r.status == 'open');

            return html`
            <div id="lobby">

                ${channel.username ? html`
                    <div class="welcome">
                        Hi, <strong>${channel.username}</strong>
                    </div>
                ` : ``}
                <h3 class="round-section-title">Send the URL of this page to invite others</h3>
                <a class='copy-link' onClick=${e => {
                    Common.copy_link(e);
                    this.setState({copied: true})
                    setTimeout( () => {
                        this.setState({copied: false})
                    }, 2000)
                }}>
                    ⧉ Copy sharable link to this game
                </a>
                ${s.copied ? html`
                    <span id="copied-text" >
                        Copied ${window.location.href}
                    </span>` : ''
                }

                <div class="rounds-content">
                    <div class="available-rounds-wrapper">
                        <h3 class="round-section-title">
                            Available rounds
                        </h3>
                        <div class="rounds">
                            <div class="rounds">
                                ${available_rounds.length == 0 ? html`
                                    <p>No rounds are currently open.</p>
                                ` : available_rounds.map(d => html`
                                    <div class="single-round-wrapper">
                                        <a class="round-link" href="/lobby/${channel.slug}/round/${d.id}" onClick=${e => Router.hijack(e)}>
                                            <div class="stack paper-stack-wrapper" >
                                                ${this.createPaperStack(d.count)}
                                            </div>
                                            <div class="round-description" >
                                                Last <strong>${d.last_turn.type}</strong> by <strong>${d.last_turn.username}</strong>
                                                <div class='time'>${Common.timeSince(d.last_turn.timestamp)} ago</div>
                                            </div>
                                            <div class='since'>
                                                Round started ${Common.timeSince(d.timestamp)} ago
                                                <br />
                                                Round ${d.count}/${d.settings.min_turns}

                                            </div>
                                        </a>
                                    </div>
                                `)}
                            </div>
                            <a 
                                href='/lobby/${channel.slug}/round/new/'
                                onClick=${e => Router.hijack(e)}
                            >
                                <span id="add-round-button" >+ Start a new round</span>
                            </a>
                        </div>
                    </div>
                    <div class="complete-rounds-wrapper">
                        <h3 class="round-section-title">
                            Completed rounds
                        </h3>
                        <div class="rounds">
                            ${completed_rounds.length == 0 ? html`
                                No rounds have been completed yet.
                            ` : completed_rounds.map(d => html`
                                <div class="single-round-wrapper">
                                    <a class="round-link" href="/lobby/${channel.slug}/round/${d.id}" onClick=${e => Router.hijack(e)}>
                                        <div class="stack paper-stack-wrapper" >
                                            ${this.createPaperStack(d.count)}
                                        </div>
                                        <div class="round-description" >
                                            Last <strong>${d.type}</strong> by <strong>${d.last_turn.handle}</strong>
                                            <div class='time'>${Common.timeSince(d.last_turn.timestamp)} ago</div>
                                        </div>
                                        <div class='since'>Round started ${Common.timeSince(d.timestamp)} ago</div>
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

        createPaperStack(count) {
            const maxcount = Math.min(count, 6);
            const countArray = Array(maxcount).fill(null)
            return countArray.map((d, i) => {
                return html `
                <div class="paper-sheet" style="left:${i * 2}px; top:${i * 1}px; transform: rotate(${Math.floor(i*2-maxcount/2)}deg);">
                    <div class="count-number">
                        ${count}
                    </div>
                </div>`
            })
        }

        static css() {
            return `
                #lobby {  display: block; }

                #lobby .copy-link { background: #fff; cursor: pointer; height: 30px; line-height: 30px; padding: 0 10px; display: inline-block; vertical-align:  middle; color: #000; }
                #lobby .copy-link:hover { background: #df69ff; color: #000; }
                #lobby .copy-link:active { background: #000; color: #fff; }
                #copied-text { color: #666; margin-left: 15px; font-size: small;}

                .stack-image { width: 50px; }
                .round-section-title { margin-top: 30px; margin-bottom: 5px; font-size: 20px; }
                .footer-image { width: 80%; margin: 0 10%; }
                .stack-image { width: 100%; position: absolute; }
                .stack-count {postion: absolute ;}
                .paper-sheet {position: absolute; box-shadow: inset 0 0 2px #000; background-color: #f5f0f0; width: 50px; height: 50px; }
                .paper-stack-wrapper { display: inline-block; position: relative; width: 50px; height: 50px; margin-right: 30px; }
                .count-number { font-size: 25px; color: #af6251; text-align: center; position: absolute; height: 100%; width: 100%; top: 50%; transform: translateY(-25%); }

                .round-link, .round-link:visited { color: #000; border-radius: 5px; margin: 6px 0; padding: 10px; background-color: rgba(130, 120, 120, 0.1); line-height: 25px; font-size: 17px; cursor: pointer; display: block; text-decoration: none; }
                .round-link .time { color: #666; }
                .round-link .since { color: #666; float: right; text-align: right; font-size: 16px; }
                .round-link:hover { background: #9ad6af;  }

            
                .round-description { display: inline-block; vertical-align: top; }
                #add-round-button { background: #efe; color: #040; line-height: 30px; padding: 0 10px; display: inline-block; }
                #add-round-button:hover { background: #707; color: #fff; }

                #lobby .welcome { margin-top: 30px; }
            `
        }

    }
});

