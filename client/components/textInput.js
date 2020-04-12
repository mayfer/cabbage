define(function(require, exports) {
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    class TextInput extends Component {
        constructor(props) {
            super();
            let channel = props.channel;
            this.state = {
            };
            //css.load("draw", Draw.css())
        }

        componentDidMount() {

        }

        componentWillUnmount() {

        }

        componentShouldUpdate(){

        }

        render(props, s) {
            const { channel } = props;
            return html`
                <div class='main-text-input'>
                <h1>hello</h1>
                    <button id='save' class='control-button'>Save</button>
                </div>
            `
        }

        static css() {
            return `
                
            `;
        }

    }

    return TextInput;
})



