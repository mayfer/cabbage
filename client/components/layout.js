
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
    const Lobby = require("components/lobby");
    const Common = require("lib/common");
    const API = require("components/api");

    class Layout extends Component {
        constructor(props) {
            super();
            let { channel, page, prompt_mode, view } = props;
            this.state = {
                channel,
                page,
                prompt_mode,
                view,
                chat_open: false,
                color: props.color,
            };

            const load_channel = async ({slug}) => {
                if(this.state.channel && this.state.channel.title && this.state.channel.slug == slug) {
                    return this.state.channel;
                } else {
                    const {channel} = await API.request({url: `/api/cabbage/channel?slug=${slug}`});
                    return channel;
                }
            }

            Router.on({
                '/': {
                    as: 'home',
                    uses: async (...args) => {
                        this.setState({page: 'home', channel: undefined}, () => {
                        });
                    }
                },
                '/newgame': {
                    as: 'newgame',
                    uses: async (...args) => {
                        this.setState({page: 'newgame', channel: undefined}, () => {
                        });
                    }
                },
                '/lobby/:slug': {
                    as: 'lobby',
                    uses: async ({slug}) => {
                        this.setState({page: 'channel', view: 'lobby', channel: await load_channel({slug})}, () => {});
                    }
                },
                '/lobby/:slug/round/new/:prompt_mode': {
                    as: 'round',
                    uses: async ({slug, prompt_mode }) => {
                        this.setState({ page: 'channel', view: 'round', channel: await load_channel({slug}), prompt_mode }, () => {});
                    }
                },
                '/lobby/:slug/round/:round_id': {
                    as: 'round',
                    uses: async ({slug, round_id }) => {
                        this.setState({page: 'channel', view: 'round', channel: await load_channel({slug}), prompt_mode }, () => {});
                    }
                },
            });

        }

        componentDidMount() {
            Events.on("logged_in", e => this.log_in(e));
        }

        setLobbyDetails({lobbyName, lobbySlug}) {
            this.setState({channel: {title :lobbyName, slug: lobbySlug}});
        }

        log_in ({detail: {user}})  {
            this.setState({user});
        }

        render(props, s) {
            const { page, channel, prompt_mode, view } = s;

            let initial_spiels;
            if(channel) {
                initial_spiels = props.initial_spiels && props.initial_spiels.length ? props.initial_spiels : [
                    {name: "lobby slug", color: "#ffa", spiel: "Hello, this is the shared chat area for anyone who joins your game.", timestamp: Date.now(), channel: channel.slug, },
                    {name: "lobby slug", color: "#ffa", spiel: "Pick a name and type away.", timestamp: Date.now(), channel: channel.slug, },
                ]
            }
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
                            <div class="game-column active column ">
                                <${Header} channel=${channel} page=${page} />
                                <div id="game-wrapper">
                                    ${(view == "lobby") ? html`
                                        <${Lobby} channel=${channel}/>
                                    ` : ''}

                                    ${(view == "round" && !prompt_mode) ? html`
                                        <${InstructionTile} channel=${channel} />                          
                                    ` : ''}

                                    ${(view == "round" && prompt_mode) ? html`                                     
                                        <${Prompt} 
                                            channel=${channel}
                                            mode=${prompt_mode}
                                            prompt='This is an example prompt'
                                        />
                                    ` : ''}
                                </div>
                            </div>
                            <div class="channel-column active column ${s.chat_open ? 'visible' : 'hidden'}">
                                <div class="padding">
                                    <${Channel} channel=${channel.slug} user=${s.user} color=${s.color} initial_spiels=${initial_spiels} />
                                </div>
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
                #content-container {
                    display: flex;
                    height: calc(100%);
                }
                #content-container .column {
                    flex-grow: 1;
                    margin: 0;
                }
                #content-container .column.channel-column {
                    position: relative;
                    overflow: hidden;
                }
                #content-container .column.channel-column > .padding {
                    margin: 10px;
                    height: calc(100% - 20px);
                    border-radius: 5px;
                    overflow: hidden;
                    position: relative;
                }
                #content-container .column:first-child {
                    margin-left: ${params.column_gap};
                }
                #content-container .column.hidden {
                    opacity: 1;
                }
                #content-container .column.channel-column { width: 25%; min-width: 350px; }
                #content-container .column.game-column { width: 75%; }

                #content-container .column {
                    height: 100%;
                    position: relative;
                    box-sizing: border-box;
                    overflow: auto;
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
                    margin: 0px auto;
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
            ` + Header.css() + Channel.css() + Prompt.css() + CreateForm.css() + Lobby.css();
        }

    }

    return Layout;
})



