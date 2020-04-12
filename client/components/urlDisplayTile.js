define(function(require, exports) {
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const { fonts } = require("components/theme");
    const Router = require("components/router");


    return class urlDisplayTile extends Component {
        constructor(props) {
            super();
            this.state = {};
            css.load("url-display", urlDisplayTile.css())
        }

        render(props, s) {
            return html`
            <div class="form-container">
                <div>
                    Share this URL to bring others into the game room
                </div>
                <div>
                    ${window.location.href}
                </div>
                <div>
                    <button onclick=${e => this.copy_link(e)}>
                        Copy link
                    </button>
                </div>
            </div>
            `;
        }

        static css() {
            return `
                .form-container { background: #76ba8d; height: 400px; width: 600px; border: 3px solid #000; margin-right: auto; margin-left: auto; display: flex; justify-content: center; flex-direction: column ; text-align: center}
                button { border: 3px solid #000; }
            `
        }

        async copy_link(e) {
            e.preventDefault()
            var dummy = document.createElement("textarea");
            document.body.appendChild(dummy);
            dummy.value = window.location.href;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
        }
    }
});
