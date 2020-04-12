define(function(require, exports) {
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const { fonts } = require("components/theme");

    return class Header extends Component {

        render({ page }, { todos = [] }) {
            return html`
                <div id='header'>
                    <div id='logo'>
                        <a href='/' class="go-to" data-channel="">
                            <img src="/client/assets/cabbage.png" id='logo' />
                        </a>
                    </div>
                </div>
            `;
        }


        static css() {
            return `
                #header {  height: 60px; padding: 0 15px; position: relative;  }
            
                #logo { height: 90px; display: inline-block; opacity: 0.9; }
                #logo:hover { opacity: 1; }
                #logo:active { position: relative; top: 1px; left: 1px; }
                
                #logo a { height: 60px; line-height: 60px; color: #000; text-decoration: none; display: inline-block; vertical-align: middle; font-family: ${fonts.mono}; opacity: 0.8; }
                #logo a img { display: inline-block; height: 80px; margin: 5px 0; }


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

