define(function(require, exports) {
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const { fonts } = require("components/theme");

    return class Header extends Component {

        render(props, s) {
            return html`
                <div id='header'>
                    <div id='logo'>
                        <a href='/' class="go-to" data-channel="">
                            <img src="/client/assets/cabbage.png" id='logo' />
                        </a>
                    </div>
                    ${this.props.channel ? html`
                        <div id='game-text'>
                            <span id="lobbyName-text">
                                ${this.props.channel.title}
                            </span>
                            <button id="copy-link-button" onclick=${e => {
                                Common.copy_link(e);
                                this.setState({copied: true})
                                setTimeout( () => {
                                    this.setState({copied: false})
                                }, 1000)
                            }}>
                                Copy sharable link
                            </button> 
                            ${s.copied ? html`
                                <span id="copied-text" >
                                    Copied!
                                </span>` : ''
                            }
                        </div>
                    ` : html``}
                </div>
            `;
        }

        static css() {
            return `
                #header {  height: 60px; padding: 0 15px; position: relative; display: flex; margin-top: 10px; }
            
                #logo { height: 90px; display: inline-block; opacity: 0.9; margin-right: 190px; }
                #logo:hover { opacity: 1; }
                #logo:active { position: relative; top: 1px; left: 1px; }
                
                #logo a { height: 60px; line-height: 60px; color: #000; text-decoration: none; display: inline-block; vertical-align: middle; font-family: ${fonts.mono}; opacity: 0.8; }
                #logo a img { display: inline-block; height: 50px; margin: 5px 0; }
                
                #lobbyName-text { margin-right: 10px; margin-left: 5px; font-weight: bolder; color: black; }

                #game-text { font-size: larger; margin-top: 16px; } 

                #copied-text { color: gray; margin-left: 15px; font-size: small;}

                @media only screen and (max-width: 600px) {
                    #header { text-align: left; }
                }
                @media only screen and (min-width: 600px) {
                    #header { text-align: center; }
                }
                                
            `
        }
    }
});

