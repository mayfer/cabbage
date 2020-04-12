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

        bok(){
        	alert('bok bok bok!')
        }

        render(props, s) {
            const { channel } = props;
            return html`
                <div class='main-textarea'>
                	<textarea placeholder="Enter a prompt!" />
                	<div>
	                    <button id='save' class='control-button' onClick=${this.bok}>Save</button>
                    </div>
                </div>
            `
        }

        static css() {
            return `
            	.main-textarea { width: 100%; padding-top: 50px; display: flex; align-items: center; flex-flow: column;}
            	.main-textarea textarea { width: 100%; height: 300px; resize: none; border: 2px solid black; font-size: 30px; padding: 20px; box-sizing: border-box;}
            	.main-textarea textarea:focus { outline: none; }
            `;
        }

    }

    return TextInput;
})



