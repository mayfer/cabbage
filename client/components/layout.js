
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
    const RoundOverview = require("components/roundOverview");
    const Common = require("lib/common");
    const API = require("components/api");

    class Layout extends Component {
        constructor(props) {
            super();
            let { channel, page, prompt_mode, view, round, user } = props;
	    if(channel) user.handle = channel.username;
            this.state = {
                channel,
                page,
                prompt_mode: prompt_mode || ((round && round.last_turn) ? (round.last_turn.type == 'drawing' ? 'textAsResponse' : 'drawAsResponse') : undefined),
                view,
                chat_open: false,
                color: props.color,
                round,
                user,
            };

            const load_channel = async ({slug, force}) => {
                if(!force && this.state.channel && this.state.channel.title && this.state.channel.slug == slug) {
                    return this.state.channel;
                } else {
                    this.setState({loading: true})
                    const {channel} = await API.request({url: `/api/cabbage/channel?slug=${slug}`});
                    this.setState({loading: false, channel});
                    if(channel.username) {
                        let _user = this.state.user;
                        user.handle = channel.username;
                        this.setState({user});
                    }
                    return channel;
                }
            }

            Router.on({
                '/': {
                    as: 'home',
                    uses: async (...args) => {
                        this.setState({page: 'home', channel: undefined}, async () => {
                            const {user} = await API.request({url: `/api/me`});
                            this.setState({user});
                        });
                    }
                },
                '/newgame': {
                    as: 'newgame',
                    uses: async (...args) => {
                        this.setState({page: 'newgame', channel: undefined, round: undefined}, () => {
                        });
                    }
                },
                '/lobby/:slug': {
                    as: 'lobby',
                    uses: async ({slug}) => {
                        this.setState({page: 'channel', view: 'lobby', round: undefined, channel: await load_channel({slug, force: true})}, () => {});
                    }
                },
                '/lobby/:slug/round/new': {
                    as: 'round',
                    uses: async ({slug, prompt_mode }) => {
                        this.setState({ page: 'channel', view: 'round', round: undefined, channel: await load_channel({slug}), prompt_mode: undefined }, () => {});
                    }
                },
                '/lobby/:slug/round/new/:prompt_mode': {
                    as: 'round',
                    uses: async ({slug, prompt_mode }) => {
                        this.setState({ page: 'channel', view: 'round', round: undefined, channel: await load_channel({slug}), prompt_mode }, () => {});
                    }
                },
                '/lobby/:slug/round/:round_id': {
                    as: 'round',
                    uses: async ({slug, round_id }) => {
                        this.setState({loading: true, page: 'channel', view: 'round', channel: await load_channel({slug}), round: undefined }, async () => {
                            const {round} = await API.request({method: 'get', url: '/api/round/'+round_id,})
                            if(round) {
                                let prompt_mode = round.last_turn && round.last_turn.type == 'drawing' ? 'textAsResponse' : 'drawAsResponse';
                                this.setState({loading: false, prompt_mode, round})
                            }
                        });
                    }
                },
            });

        }

        componentDidMount() {
            Events.on("logged_in", e => this.log_in(e));
            if(this.pick_name) setTimeout(() => this.pick_name.focus(), 500);
        }

        setLobbyDetails({lobbyName, lobbySlug}) {
            this.setState({channel: {title :lobbyName, slug: lobbySlug}});
        }
        async setEmailAddress(e) {
            e.preventDefault();
            const email = this.state.email;
            await API.request({"method": "post", "url": "/api/email", body: {email}})
            const _user = this.state.user;
            _user.email = email;
            this.setState({user: _user})
        }

        log_in ({detail: {user}})  {
            this.setState({user});
        }

        toggleChatOnMobile() {
            this.setState({mobile_chat: !this.state.mobile_chat});
        }

        render(props, s) {
            const { page, channel, prompt_mode, view, round } = s;
            const users = channel && channel.users ? channel.users.filter(u => u) : [];

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

                                        <div class='your-channels'>
                                            ${s.user.channels ? s.user.channels.map(c => html`
                                                <br /><a class='channel' href='/lobby/${c.slug}' onClick=${e => { e.preventDefault(); Router.navigate('/lobby/'+c.slug); }}>${c.title}</a>
                                            `) : ''}
                                        </div>

                                        <p>It's a game we play among our friends with pen and paper IRL.</p>
                                        <p>It's sort of like paper telephone; every round begins with a prompt (text or drawing), which the next player then has to follow up with the other type (drawing or text)</p>
                                        <div style=" width: 100%; border: 3px solid #000; padding: 10px;">
                                            Warning -- the game is not fully ready yet.<br />
                                            ${s.user.email ? html`We will e-mail you when we launch. Thanks!` : html`
                                                Enter your e-mail address if you'd like to be notified when it's done later this week.
                                                <form onSubmit=${e => this.setEmailAddress(e)}>
                                                    <input type='text' name='email' placeholder='E-mail address'  onInput=${e => this.setState({email: e.target.value})} />
                                                    <br /><input type='submit' value="Submit" name='email' placeholder='E-mail address'/>
                                                </form>
                                            `}
                                        </div>
                                        <ul>
                                            <li>If you are <strong>prompted with text</strong>, you <strong>draw</strong> your version of it.</li>
                                            <li>If you are <strong>prompted with a drawing</strong>, you <strong>caption it with text</strong>.</li>
                                            <li>During the rounds, you only see what you are passed off from the other player; you don't get to see the full chain of submissions until the round ends.</li>
                                            <li>A round ends when either (a) every player has made a submission, or (b) the round times out.</li>
                                        </ul>
                                    `}
                                    <hr style="margin: 100px;" />
                                    <p>Cabbage<span class='af'>af</span> was made for the <a href='https://pioneer.app/hackathon'>Pioneer hackathon</a> on April 11-12, 2020</p>
                                    <p>by Murat, Adele, Madeleine and Theo.<br />contact@probablymurat.com</p>

                                    <img class='authors-img' src='/client/assets/authors.svg' />
                                </div>
                            </div>
                        ` : ``}


                        ${(page == "channel" && channel) ? html`
                            <div class="columns">
                                <div class="game-column active column">
                                    <${Header} channel=${channel} page=${page} />
                                    ${channel.username || (round && round.status == 'closed') ? html`
                                    ` : html`
                                        <div class="pick-name">
                                            <div class="inner">
                                                ${users && users.length > 0 ? html`
                                                    Pick a name to join <strong>${channel.title}</strong>:
                                                ` : html`
                                                    Pick a name for yourself in <strong>${channel.title}</strong>:
                                                `}
                                                <form onSubmit=${async (e) => {
                                                    e.preventDefault();
                                                    let {channel: updated_channel} = await API.request({method: "post", url: "/api/cabbage/channel/pick-name/", body: {slug: channel.slug, username: this.state.pick_name}});
                                                    let _user = this.state.user;
                                                    _user.handle = updated_channel.username;
                                                    this.setState({channel: updated_channel, user: _user});
                                                }}>
                                                    <input type="text" onInput=${e => this.setState({pick_name: e.target.value})} ref=${r => this.pick_name=r} />
                                                    <br />
                                                    <button type="submit">Pick name</button>
                                                </form>
                                                ${users && users.length > 0 ? html`
                                                    <div class='members'>
                                                        Members:
                                                        ${users.map(username => html`
                                                            <div class="user"><strong>${username}</strong></div>
                                                        `)}
                                                    </div>
                                                 ` : html``}
                                            </div>
                                        </div>
                                    `}
                                    <div id="game-wrapper" class="${channel.username || (round && round.status == 'closed') ? '' : 'disabled'}">

                                        ${s.loading ? html`
                                            <div class="loading">Loading</div>
                                        ` : html`
                                            ${(view == "lobby") ? html`
                                                <${Lobby} channel=${channel} />
                                            ` : ''}

                                            ${(view == "round" && !prompt_mode && !round) ? html`
                                                <${InstructionTile} channel=${channel} />                          
                                            ` : ''}

                                            ${(view == "round" && prompt_mode && (!round || round.status == 'open')) ? html`                                     
                                                <${Prompt} 
                                                    channel=${channel}
                                                    mode=${prompt_mode}
                                                    round=${round}
                                                    loadingHandler=${({loading}) => this.setState({loading})}
                                                />
                                            ` : ''}

                                            ${(view == "round" && round && round.status == "closed") ? html`                                     
                                                <${RoundOverview} 
                                                    channel=${channel}
                                                    round=${round}
                                                />
                                            ` : ''}
                                        `}
                                    </div>
                                </div>
                                <div class="channel-column active column ${s.mobile_chat ? 'visible' : 'hidden'}">
                                    <div class="padding">
                                        <${Channel} channel=${channel.slug} user=${s.user} color=${s.color} initial_spiels=${initial_spiels} />
                                    </div>
                                </div>
                            </div>
                        ` : ``}
                    </div>
                </div>
                <div id="chat-toggle" onClick=${e => this.toggleChatOnMobile()}>💬</div>
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

                #content-container {
                    position: relative;
                    height: calc(100%);
                }
                #content-container .columns {
                    background: #000;
                    display: flex;
                    position: relative;
                    height: 100%;
                }
                #content-container .column {
                    flex-grow: 1;
                    position: relative;
                    box-sizing: border-box;
                    overflow: auto;
                    z-index: 1;
                    margin: ${params.column_gap};
                    margin-left: 0px;
                }
                #content-container .column:first-child {
                    margin-left: ${params.column_gap};
                }

                #content-container .column.channel-column {
                    position: relative;
                    overflow: hidden;
                }
                #content-container .column.channel-column > .padding {
                    
                    height: calc(100% - 0px);
                    border-radius: 5px;
                    overflow: hidden;
                    position: relative;
                }
                #content-container .column.hidden {
                    opacity: 1;
                }
                #content-container .column.channel-column { width: 25%; min-width: 350px; }
                #content-container .column.game-column { width: 75%; position: relative; 
                    background: #f9d49c; border-radius: 5px; }


                #content-container > .inner {
                    width: 100%;
                }

                #content-container .pick-name {
                    text-align: center;
                }
                #content-container .pick-name .inner {
                    margin: 50px;
                    font-size: 23px;
                    padding: 30px;
                    display: inline-block;
                    background: rgba(255, 255, 255 ,0.4); 
                }
                #content-container .pick-name form {
                    margin-top: 20px;
                }
                #content-container .pick-name input {
                    font-size: 18px; padding: 10px; line-height: 20px; width: 300px; border: 3px solid #000;
                    border-color: transparent;
                }
                #content-container .pick-name input:focus {
                    border-color: #03f;
                }
                #content-container .pick-name button {
                    display: inline-block;
                    padding: 10px 30px;
                    margin: 10px;
                    background: #e2806a;
                    color: #fff;
                    font-size: 30px;
                    cursor: pointer;
                    border: none;
                }
                #content-container .pick-name .members {
                    font-size: 17px;
                    color: rgba(0, 0, 0, 0.9);
                    margin-top: 30px;
                }

                #content-container .loading {
                    margin: 50px;
                    font-size: 60px;
                    color: rgba(0, 0, 0, 0.2);
                    text-align: center;
                    display: block;
                }

                h1, h2, h3, h4, h5 { color: #e2806a; }

                .landing { text-align: center; margin: 30px; display: inline-block;  max-width: 900px; margin: 30px auto; display: block; line-height: 35px; font-size: 21px; }
                .landing .af { color: rgba(126, 86, 86, 0.9); font-weight: bold; font-size: 13px; transform: rotate(-20deg); display: inline-block; position: relative; top: 5px;}
                .landing .home-logo { height: 125px; }
                .landing ul {text-align: left; }
                .landing li {text-align: left; margin: 10px; }
                .landing .newgame { text-decoration: none; display: inline-block; padding: 10px 30px; background: #0a0; color: #fff; font-size: 30px; }
                .landing .newgame:hover { background: #000; }
                .landing .newgame:active { background: #00a; }
                .landing .authors-img { width: 600px; }

                .landing .your-channels .channel { margin-top: 10px; text-decoration: none; display: inline-block; padding: 10px 30px; background: #26a; color: #fff; font-size: 30px; }

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
                    display: flex-grow;
                }
                #game-wrapper.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                    -webkit-filter: blur(5px) grayscale(100%);
                    -moz-filter: blur(5px) grayscale(100%);
                    -o-filter: blur(5px) grayscale(100%);
                    -ms-filter: blur(5px) grayscale(100%);
                    filter: blur(5px) grayscale(100%);
                }

                #chat-toggle { display: none; }
                @media only screen and (min-width: 1000px) {

                }
                @media only screen and (max-width: 1000px) {

                    #content-container .column.channel-column {
                        display: none;
                    }
                    #content-container .column.visible {
                        display: block;
                    }
                    #content-container .column {
                        margin: 0;
                    }
                    #content-container .column:first-child {
                        margin-left: 0;
                    }
                    #game-wrapper {
                        width: calc(100% - 20px) ;
                    }
                    #chat-toggle {  z-index: 1; display: block; line-height: 50px; text-align: center; font-size: 30px; position: absolute; bottom: 10px; left: 10px; border-radius: 50%; height: 50px; width: 50px; background: #000; color: #fff; box-shadow: -3px 3px 0px 3px #eef; cursor: pointer; }
                    #chat-toggle:hover {  background: #fff; box-shadow: -3px 3px 0px 3px #00f;  }
                }
            ` + Header.css() + Channel.css() + Prompt.css() + CreateForm.css() + Lobby.css() + RoundOverview.css();
        }

    }

    return Layout;
})



