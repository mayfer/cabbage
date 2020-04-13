
define(function(require, exports) {
    const io = require("sockets/socket.io");
    
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    const Events = require("components/events");
    const Router = require("components/router");
    const Header = require("components/header");
    const Channel = require("components/channel/channel");
    const Prompt = require("components/prompt")
    const { fonts } = require("components/theme");
    const CreateForm = require("components/create");
    const InstructionTile = require("components/instructionTile");
    const Rounds = require("components/rounds");
    const Common = require("lib/common");

    class Layout extends Component {
        constructor(props) {
            super();
            let { channel, page } = props;
            this.state = {
                channel,
                page,
                chat_open: false,
                color: props.color,
            };
            Router.on({
                '/': {
                    as: 'home',
                    uses: (...args) => {
                        this.setState({page: 'home', channel: undefined}, () => {
                        });
                    }
                },
                '/newgame': {
                    as: 'newgame',
                    uses: (...args) => {
                        this.setState({page: 'newgame', channel: undefined}, () => {
                        });
                    }
                },
                '/lobby/:channel': {
                    as: 'lobby',
                    uses: ({channel}) => {
                        this.setState({page: 'channel', channel}, () => {
                        });
                    }
                },
                '/lobby/:channel/round/:round_id': {
                    as: 'round',
                    uses: ({channel, round_id}) => {
                        this.setState({page: 'round', channel}, () => {
                        });
                    }
                },
                '/lobby/:channel/newturn/:round_id': {
                    as: 'newturn',
                    uses: ({channel, round_id}) => {
                        this.setState({page: 'round', channel}, () => {
                        });
                    }
                },
            });

        }

        componentDidMount() {
            Events.on("logged_in", e => this.log_in(e));
        }

        setLobbyDetails({lobbyName, lobbySlug}) {
            this.setState({lobbyName: lobbyName, slug: lobbySlug});
        }

        log_in ({detail: {user}})  {
            this.setState({user});
        }

        render(props, s) {
            const { page, channel } = s;
            const titleURLString = `Share the URL to bring others into ${s.lobbyName}`;
            return html`
                <div id="layout">
                    <div id="content-container">
                        ${(page == "home" || page == "newgame") ? html`
                            <div class='inner'>
                                <div class='landing'>

                                    <a href='/' class="go-to" data-channel="">
                                        <img src="/client/assets/cabbage-af.png" class='home-logo' />
                                    </a>

                                    ${page == "newgame" ? html`
                                        <div class='inner'>
                                            <${CreateForm} setLobbyDetails=${(l) => this.setLobbyDetails(l)} />
                                        </div>
                                    ` : html`
                                        <p>Cabbage<span class='af'>AF</span> is a drawing game for groups.</p>
                                        <a class='newgame' href='/newgame' onClick=${e => { e.preventDefault(); Router.navigate('/newgame'); }}>New Game</a>

                                        <p>It's a game we play among our friends with pen and paper IRL.</p>
                                        <p>It's sort of like paper telephone; every round begins with a prompt (text or drawing), which the next player then has to follow up with the other type (drawing or text)</p>
                                        <div style="height: 150px; width: 100%; border: 3px solid #000; padding: 10px;">Placeholder - this will have an example round</div>
                                        <ul>
                                            <li>If you are <strong>prompted with text</strong>, you <strong>draw</strong> your version of it.</li>
                                            <li>If you are <strong>prompted with a drawing</strong>, you <strong>caption it with text</strong>.</li>
                                            <li>During the rounds, you only see what you are passed off from the other player; you don't get to see the full chain of submissions until the round ends.</li>
                                            <li>A round ends when either (a) every player has made a submission, or (b) the round times out.</li>
                                        </ul>
                                        <a class='newgame' href='/newgame' onClick=${e => { e.preventDefault(); Router.navigate('/newgame'); }}>New Game</a>
                                    `}
                                    <hr />
                                    <p>Cabbage<span class='af'>af</span> was made for the <a href='https://pioneer.app/hackathon'>Pioneer hackathon</a> on April 11-12, 2020</p>
                                    <p>by Murat, Adele, Madeleine and Theo.<br />contact@probablymurat.com</p>

                                    <img class='authors-img' src='/client/assets/authors.svg' />
                                </div>
                            </div>
                        ` : ``}


                        ${(page == "channel" && channel) ? html`
                            <${Header} lobbyName=${s.lobbyName} lobbySlug=${s.lobbySlug} page=${page} />

                            <div class="game-column active column ">
                                <div id="game-wrapper">
                                    <${Prompt} 
                                        mode='imageAsResponse'
                                        prompt='This is an example prompt'
                                    />
                                </div>
                            </div>
                            <div class="channel-column active column ${s.chat_open ? 'visible' : 'hidden'}">
                                <${Channel} channel=${s.channel} user=${s.user} color=${s.color} initial_spiels=${props.initial_spiels || []} />
                            </div>
                        ` : ``}
                    </div>
                </div>
            `
        }

        static css() {
            let params = {
                column_gap: "10px",
            }
            return `
                .grecaptcha-badge { display: none; }

                #layout { position: relative; height: 100%; box-sizing: border-box; font-family: ${fonts.sans}; }
                #layout {
                    /* iphone X notch */
                    margin-top: env(safe-area-inset-top);
                    margin-top: constant(safe-area-inset-top);
                    height: calc(100% - constant(safe-area-inset-top)); 
                    height: calc(100% - env(safe-area-inset-top));
                    overflow: scroll;
                }

                .game-column.active.column {
                    text-align: center; 
                }

                #content-container {
                    position: relative;
                }

                #content-container .column {
                    height: 100%;
                    position: relative;
                    box-sizing: border-box;
                    border-radius: 5px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    z-index: 1;
                }

                #content-container .inner {
                    width: 100%;
                }

                .landing { text-align: center; font-size: 20px; margin: 30px; display: inline-block;  max-width: 900px; margin: 30px auto; display: block; line-height: 35px; font-size: 24px; }
                .landing .af { color: rgba(126, 86, 86, 0.9); font-weight: bold; font-size: 13px; transform: rotate(-20deg); display: inline-block; position: relative; top: 5px;}
                .landing .home-logo { height: 125px; }
                .landing ul {text-align: left; }
                .landing li {text-align: left; margin: 10px; }
                .landing .newgame { text-decoration: none; display: inline-block; padding: 10px 30px; background: #0a0; color: #fff; font-size: 30px; }
                .landing .newgame:hover { background: #000; }
                .landing .newgame:active { background: #00a; }
                .landing .authors-img { width: 600px; }

                #copy-link-button {
                    margin-top: 10px;
                }

                button {
                    outline: none;
                    border: 2px solid #000;
                }

                button:hover {
                    opacity: 0.8;
                    border: 2px solid rgba(0,0,0,0.8);
                }

                button:active {
                    position: relative;
                    top: 1px;
                    left: 1px;
                }

                #game-wrapper {
                    width: 600px;
                    margin: 50px auto;
                    justify-content: center;
                    align-items: center;
                    flex-flow: column;
                    color: grey;
                    display: inline-block;
                }


                @media only screen and (min-width: 600px) {


                }
                @media only screen and (max-width: 600px) {
                }
            ` + Header.css() + Channel.css() + Prompt.css() + CreateForm.css();
        }

    }

    return Layout;
})



