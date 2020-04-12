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
					<img src='/client/assets/cabbage-af.png' id="prompt-image" />
					<${TextInput} />
					` : ''}
					${promptMode === 'imageResponse' ? html`
					<div id='text-prompt-wrapper'>
						<h2>This is an example prompt</h2>
					</div>
					<${DrawingCanvas} />
					` : ''}
				</div>
            `
        }

        static css() {
            return `
            	#prompt-container {
            		padding-top: 20px;
            	}
            	#prompt-image {
            		width: 100%;
            	}
            	#text-prompt-wrapper h2 { 
            		margin: 0 0 10px 0;
            	}
            ` + DrawingCanvas.css() + TextInput.css();
        }

    }

    return Prompt;
})


