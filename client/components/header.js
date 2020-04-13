define(function(require, exports) {
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const Router = require("components/router");
    const { fonts } = require("components/theme");

    return class Header extends Component {

        render(props, s) {
            return html`
                <div id='header'>
                    <div id='logo'>
                        <a href='/' class="go-to" data-channel=""  onClick=${e => {
                            e.preventDefault();
                            Router.navigate(`/`);
                        }}>
                            <img src="/client/assets/cabbage.png" id='logo' />
                        </a>
                    </div>
                    ${this.props.channel ? html`
                        <div id='game-text'>
                            <span id="title" onClick=${e => Router.navigate(`/lobby/${this.props.channel.slug}/`)}>
                                ${this.props.channel.title}
                            </span>
                        </div>
                    ` : html``}
                </div>
            `;
        }

        static css() {
            return `
                #header {  height: 60px; padding: 0 15px; position: relative; display: flex; margin-top: 10px; }

                #game-text { font-size: 25px; line-height: 60px; height: 60px; } 
                #title { display: inline-block; font-weight: bolder; color: rgb(33, 85, 46); line-height: 60px; height: 60px; font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif ;  cursor: pointer; }
                #title:hover { color: #000;  }
            
                #logo { display: inline-block; opacity: 0.9; margin-right: 30px; }
                #logo:hover { opacity: 1; }
                #logo:active { position: relative; top: 1px; left: 1px; }
                
                #logo a { height: 60px; line-height: 60px; color: #000; text-decoration: none; display: inline-block; vertical-align: middle; font-family: ${fonts.mono}; opacity: 0.8; }
                #logo a img { display: inline-block; height: 50px; margin: 5px 0; }
                

                @media only screen and (max-width: 600px) {
                }
                @media only screen and (min-width: 600px) {
                }
                                
            `
        }
    }
});

