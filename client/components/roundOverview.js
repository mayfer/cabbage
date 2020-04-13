define(function(require, exports) {
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const { fonts } = require("components/theme");
    const Router = require("components/router");


    return class InstructionTile extends Component {
        constructor(props) {
            super();
            this.state = {};
            css.load("instruction-tile", InstructionTile.css())
        }

        render(props, s) {
            return html`
            <div class="">
            </div>
            `;
        }

        static css() {
            return `

            `
        }
    }
});

