
define(function(require, exports) {
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');


    const { fonts } = require("components/theme");
    const Common = require("lib/common");
    const ChannelDetails = require("./details");
    const ChannelStream = require("./stream");
    const Router = require("components/router");

    class Channel extends Component {
    
        constructor(props) {
            super()
            let { channel, user, color, initial_spiels } = props;
            this.state = {
                spiels: initial_spiels.length > 0 ? initial_spiels : [
                    {name: "bot", color: "#ffa", spiel: "Hello, this is the shared chat area for anyone who joins your game.", timestamp: Date.now(), channel, },
                    {name: "bot", color: "#ffa", spiel: "Pick a name and feel free to bother everyone.", timestamp: Date.now(), channel, },
                ],
                loading: false,
                online_count: 0,
                narrow: true,
            };

            this.state.channel_tab = 'stream';
            
            this.handle_new_spiel = this.handle_new_spiel.bind(this);

        }

        checkWidth() {
            let narrow = this.__P ? this.__P.offsetWidth < 600 : false;
            if(this.state.narrow !== narrow) this.setState({narrow});
        }

        componentDidMount() {
            this.resize_evt = window.addEventListener('resize', e => this.checkWidth() );
            this.checkWidth();

            require(["sockets/client"],  ({get_connection}) => {
                get_connection.then(({socket, socketio}) => {  
                    socket.on("online_count", ({channel, count}) => {
                        if(channel == this.props.channel) {
                            this.setState({
                                online_count: count,
                            })
                        }
                    });
                    socket.on("spiel", ({spiel}) => {
                        this.handle_new_spiel({spiel});
                    });

                    socket.emit("join_channel", {new_channel: this.props.channel});
                });
            });
        }

        componentDidUpdate(prevProps, prevState) {
            if(this.props.force || prevProps.channel !== this.props.channel) {
                /*
                window.events.emit("loading_channel", {channel});

                window.socketio.emit("leave_channel", {old_channel: this.state.channel});
                window.socketio.emit("join_channel", {new_channel: channel});
                */
                let {channel} = this.props;
                this.setState({spiels: [], loading: true}, () => {
                    this.stream.post.textarea.focus();
                });
                fetch("/api/channel/"+channel).then(data => data.json()).then(res => {
                    let {spiels, channel} = res;
                    this.setState({spiels, loading: false}, () => {
                        this.scrollToBottom();
                    });
                    
                });
            }
        }

        scrollToBottom() {
            if(this.stream) this.stream.scrollToBottom();
        }
        animateToBottom() {
            if(this.stream) this.stream.animateToBottom();
        }

        clickFocusHandler(e) {
            if(!e.target.matches('input') &&
               !e.target.matches('select') &&
               !e.target.matches('textarea') &&
               !e.target.matches('label') &&
               !e.target.matches('form') &&
               !e.target.matches('canvas') &&
               !e.target.matches('[contenteditable]') != "true") {
                   setTimeout(() => {
                        this.stream.post.textarea.focus();
                   }, 100);
            }
        }
        
        handle_new_spiel({spiel}) {
            const { channel } = spiel;
            if(channel == this.props.channel) {
                let found = false;
                this.state.spiels.forEach(s => {
                    if(s.spiel_id == spiel.spiel_id) {
                        found = true;
                    }
                });
                if(found) {
                    this.setState({
                        spiels: this.state.spiels.map(s => {
                            if(s.spiel_id == spiel.spiel_id) {
                                return spiel;
                            } else {
                                return s;
                            }
                        })
                    }, () => this.animateToBottom() );
                } else {
                    this.setState({
                      spiels: [...this.state.spiels, spiel]
                    }, () => this.animateToBottom() );
                }
            }
        }

        render(props, s) {
            return html`
                <div class="channel-container ${s.narrow ? 'narrow' : ''}" onClick=${e => this.clickFocusHandler(e)}>
                    <div class='channel-details-container channel-tab ${s.channel_tab == 'details' ? 'active' : 'inactive'}'>
                        <${ChannelDetails} channel=${props.channel} />
                    </div>
                    <div class='channel-stream-container channel-tab  ${s.channel_tab == 'stream' ? 'active' : 'inactive'}'>
                        <${ChannelStream}
                            narrow=${s.narrow}
                            channel=${props.channel}
                            user=${props.user}
                            color=${props.color}
                            spiels=${s.spiels}
                            loading=${s.loading}
                            handle_new_spiel=${this.handle_new_spiel}
                            ref=${r => this.stream=r}
                        />
                    </div>
                    <div class='channel-header'>
                        ${s.is_child_channel ?
                            html`
                                <a class='channel prev-channel'>#parent</a>
                                &raquo;
                            ` : html``
                        }
                        ${s.narrow ? html`
                                <span class='toggle-channel-tab' onClick=${
                                    e => {
                                        if(this.state.channel_tab == 'stream') {
                                            this.setState({channel_tab: 'details'});
                                        } else {
                                            this.setState({channel_tab: 'stream'});
                                        }
                                    }
                                }>
                                    ⚙
                                </span>
                            ` : html``
                        }

                        <a class='channel current-channel go-to' href='/channel/${props.channel}' onClick=${(e) => {
                                e.preventDefault();
                                const url = `/channel/${props.channel}`;
                                Router._lastRouteResolved = null;
                                Router.navigate(url);
                            }}>
                            #${props.channel}
                        </a>
                        <span class='online-indicator'>${s.online_count} online</span>
                            
                    </div>
                </div>
                
            `
        }

        static css() {
            return `
                .channel-container {
                    height: 100%;
                    box-sizing: border-box;
                    padding-top: 40px;
                    position: relative;
                    background: rgba(39, 40, 45, 0.97);
                    display: flex;
                    color: rgba(255, 255, 255, 0.5);
                }

                .channel-container.narrow .channel-tab.inactive { display: none; }

                .channel-container.narrow .channel-header .search-label input { width: 0; }
                .channel-container.narrow .channel-details-container {
                    width: 100%;
                }

                .channel-container .toggle-channel-tab { display: inline-block; padding: 0 10px; display: none; cursor: pointer; }
                .channel-container .toggle-channel-tab:hover { color: #fff; }

                .channel-container.narrow .channel-header .channel {
                    display: none;
                }

            ` + css.add_parents(".channel-container", `
                
                .channel-details-container {
                    width: 30%;
                    flex-grow: 0;
                    position: relative;
                    height: 100%;
                }
                .channel-stream-container {
                    flex-grow: 1;
                    position: relative;
                    height: 100%;
                }

                .channel-header {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: none;
                    line-height: 40px;
                    padding: 0 5px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                .channel-header .channel {
                    background: #222;
                    box-shadow: 2px 2px 0 #000;
                    color: #eee;
                    border-radius: 3px;
                    padding: 0 15px;
                    line-height: 30px;
                    display: inline-block;
                    cursor: pointer;
                    font-size: 18px;
                }
                .channel-header .current-channel {
                    background: #444;
                    text-decoration: none;
                }
                .channel-header .current-channel:hover {
                    background: #555;
                }
                .channel-header .current-channel:active {
                    position: relative; top: 2px; left: 2px;
                    box-shadow: none;
                }

                .online-indicator {
                    margin: 0 10px;
                }


                                            
                .channel-header .search-label { text-align: center; height: 40px; line-height: 40px; position: absolute; top: 0; right: 0; }

                .channel-header .search-label { margin: 5px 3px 5px 3px; display: block; }
                .channel-header .search-label .search-form { display: block; padding: 0; margin: 0; height: 30px; line-height: 30px; position: relative; color: #fff; cursor: text; background: rgba(255, 255, 255, 0.1); border-radius: 15px;  text-align: left; }
                .channel-header .search-bar .search-form.focused { border-bottom-right-radius: 0; border-bottom-left-radius: 0; }
                .channel-header .search-bar.searching  { width: 350px; }
                .channel-header .search-label .icon { display: inline-block; height: 22px; line-height: 22px; width: 22px; margin: 4px 0 4px 7px; text-align: center; fill: #999; pointer-events: none; }
                .channel-header .search-label .search-form .icon { color: #fff; }
                .channel-header .search-label input { display: inline-block; border: 1px solid transparent; font-size: 15px; line-height: 28px; height: 28px; background: none; padding: 0; width: 200px; color: #fff; font-family: ${fonts.sans}; font-size: 13px; vertical-align: top; }
                .channel-header .search-label .suggestions { width: 100%; position: absolute; top: 24px; left: 0px; color: #333;  border-top: none; background: #ae4846; box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.5); display: none; border-radius: 12.5px; border-top-left-radius: 0; border-top-right-radius: 0; box-sizing: border-box; padding: 10px; }
                .channel-header .search-label .loading { color: rgba(255, 255, 255, 0.5); font-size: 12px; }
                .channel-header .search-label form.search-form { display: block; }

                .channel-header .search-label ::-webkit-input-placeholder { color: rgba(255, 255, 255, 0.4); }
                .channel-header .search-label :-moz-placeholder {  color: rgba(255, 255, 255, 0.4); opacity:  1; }
                .channel-header .search-label ::-moz-placeholder { color: rgba(255, 255, 255, 0.4); opacity:  1; }
                .channel-header .search-label :-ms-input-placeholder { color: rgba(255, 255, 255, 0.4); }
                .channel-header .search-label input:focus { outline: none; }

                
            ` + ChannelDetails.css() + ChannelStream.css());
        }

    }

    return Channel;
})


