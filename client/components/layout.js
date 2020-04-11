
define(function(require, exports) {
    const io = require("sockets/socket.io");
    
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    const Events = require("components/events");
    const Router = require("components/router");
    const Header = require("components/header");
    const DrawingCanvas = require("components/canvas/draw");
    const Channel = require("components/channel/channel");
    const { fonts } = require("components/theme");

    class Layout extends Component {
        constructor(props) {
            super();
            let channel = props.channel;
            this.state = {
                channel,
                chat_open: false,
                color: props.color,
            };
            Router.on({
                '/': {
                    as: 'home',
                    uses: (...args) => {
                        this.setState({}, () => {
                        });
                    }
                },
                '/lobby/:channel': {
                    as: 'lobby',
                    uses: ({channel}) => {
                        this.setState({channel}, () => {
                        });
                    }
                },
                '/lobby/:channel/round/:round_id': {
                    as: 'lobby',
                    uses: ({channel, round_id}) => {
                        this.setState({channel}, () => {
                        });
                    }
                },
            });

        }

        componentDidMount() {
            Events.on("logged_in", e => this.log_in(e));
        }

        log_in ({detail: {user}})  {
            this.setState({user});
        }
        render(props, s) {
            const { channel } = props;
            return html`
                <div id="layout">
                    <div id="header-container">
                        <${Header} />
                    </div>
                    <div id="content-container">
                        ${channel ? html`
                            <div class="game-column active column ">
                                game area
                                <${DrawingCanvas} />
                            </div>
                            <div class="channel-column active column ${s.chat_open ? 'visible' : 'hidden'}">
                                <${Channel} channel=${s.channel} user=${s.user} color=${s.color} initial_spiels=${props.initial_spiels} />
                            </div>
                        ` : html`
                            Landing page
                        `}
                    </div>
                    <div id="mobile-nav">
                        
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

                }

                #content-container {
                    position: relative;
                }
                #content-container .column {
                    height: 100%;
                    position: relative;
                    box-sizing: border-box;
                    border-radius: 5px;
                    overflow: hidden;
                    z-index: 1;
                }

                @media only screen and (min-width: 600px) {
                    #content-container {
                        display: flex;
                        height: calc(100% - 40px - 5px - 10px);
                    }
                    #content-container .column {
                        flex-grow: 1;
                        margin: 5px ${params.column_gap} ${params.column_gap} 0;
                    }
                    #content-container .column:first-child {
                        margin-left: ${params.column_gap};
                    }
                    #content-container .column.hidden {
                        opacity: 1;
                    }
                    #content-container .column.channel-column { width: 20%; }
                    #content-container .column.game-column { width: 80%; }



                }
                @media only screen and (max-width: 600px) {
                    #content-container { 
                        display: block; 
                        height: calc(100% - 40px - 5px - 40px - 4px);
                    }
                    #mobile-nav { height: 44px; display: flex; }
                    #mobile-nav a { color: #aaa; text-align: center; flex-grow: 1; flex-basis: 0; line-height: 40px; border-radius: 3px; margin: 2px; text-decoration: none; }
                    #mobile-nav a.active { background: #222; color: #fff; }
                    #content-container .column { width: 100%; display: block; }
                    #content-container .column.hidden { display: none; }
                }
            ` + Header.css() + Channel.css();
        }

    }

    return Layout;
})



