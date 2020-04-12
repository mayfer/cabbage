define(function(require, exports) {

    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');
    const DrawingCanvas = require("components/prompts/canvas/draw");
    const TextInput = require("components/prompts/textInput");

    class Prompt extends Component {
        constructor(props) {
            super();
            let channel = props.channel;
            this.state = {
            };
        }

        componentDidMount() {
        }

        componentWillUnmount() {
        }

        componentShouldUpdate(){
        }

        render(props, s) {
            const { promptMode } = props;
            return html`
            	<div id="prompt-container">
					${promptMode === 'draw' ? html`
					<${DrawingCanvas} />
					` : ''}
					${promptMode === 'text' ? html`
					<${TextInput} />
					` : ''}
					${promptMode === 'textResponse' ? html`
					<img src=''/>
					<${TextInput} />
					` : ''}
				</div>
            `
        }

        static css() {
            return `
            	#prompt-container {
            		padding-top: 20px;
            	}
            ` + DrawingCanvas.css() + TextInput.css();
        }

    }

    return Prompt;
})



