define(function(require, exports) {
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const { fonts } = require("components/theme");

    return class Header extends Component {

        render(props, s) {
            var name = "beans"
            return html`
                <div id='header'>
                    <div id='logo'>
                        <a href='/' class="go-to" data-channel="">
                            <img src="/client/assets/cabbage.png" id='logo' />
                        </a>
                    </div>
                    ${name ? html`
                        <div id='game-text'>
                            <span id="lobbyName-text">
                                ${name}
                            </span>
                            <button id="copy-link-button" onclick=${e => Common.copy_link(e)}>
                                Copy sharable link
                            </button> 
                            <span id="copied-text" >
                                Copied!
                            </span>
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

                #copied-text { color: gray; visibility: none; margin-left: 15px; font-size: small;}

                @media only screen and (max-width: 600px) {
                    #header { text-align: left; }
                }
                @media only screen and (min-width: 600px) {
                    #header { text-align: center; }
                }
                                
            `
        }

        async makeCopiedTextAppear() {
            var copiedText = $("#copied-text")
            
        }
    }
});

