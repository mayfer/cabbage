define(function(require, exports) {
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const { fonts } = require("components/theme");
    const Router = require("components/router");


    return class CreateForm extends Component {
        constructor(props) {
            super();
            this.state = {};
            css.load("create-form", CreateForm.css())
        }

        render(props, s) {
            return html`
            <div class="form-container">
            </div>
            `;
        }

        static css() {
            return `
                .form-container { background: #76ba8d; height: 400px; width: 600px; border: 3px solid #000; margin-right: auto; margin-left: auto; display: flex; justify-content: center; flex-direction: column ; text-align: center}
            `
        }
    }
});

