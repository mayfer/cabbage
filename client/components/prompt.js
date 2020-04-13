define(function(require, exports) {

    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');
    const DrawingCanvas = require("components/prompts/canvas/draw");
    const TextInput = require("components/prompts/textInput");
    const API = require("components/api");
    const Router = require("components/router");

    class Prompt extends Component {
        constructor(props) {
            super();
            this.state = {
                disableSubmit: false,
            };
            this.submitFirstPrompt = this.submitFirstPrompt.bind(this)
            this.submitPromptResponse = this.submitPromptResponse.bind(this)
        }

        componentDidMount() {
        }

        componentWillUnmount() {
        }

        componentShouldUpdate(){
        }

        async submitFirstPrompt(data){
            const { channel } = this.props; 
            this.setState({ disableSubmit: true })
            const round_res = await API.request({method: "post", url: "/api/round/create", body: { channel }})
            const body = { ...data, round_id: round_res.round.id, previous_turn_id: null }
            const turn_res = await API.request({method: "post", url: "/api/turn/create", body})
            if (turn_res.ok) {
                Router.navigate(`/lobby/${channel.slug}`)
            } else {
                alert('coult not save')
                this.setState({ disableSubmit: false })
            }              
        }

        submitPromptResponse(data){

        }

        render(props, s) {
            const { mode, prompt, channel } = props;
            return html`
            	<div id="prompt-container">
					${mode === 'draw' ? html`
						<${DrawingCanvas} submitPrompt=${this.submitFirstPrompt}/>
					` : ''}
					${mode === 'text' ? html`
						<${TextInput} submitPrompt=${this.submitFirstPrompt}/>
					` : ''}
					${mode === 'textAsResponse' ? html`
						<img src=${prompt} id="prompt-image" />
						<${TextInput} submitPrompt=${this.submitPromptResponse} />
					` : ''}
					${mode === 'drawAsResponse' ? html`
						<div id='text-prompt-wrapper'>
							<h2>${prompt}</h2>
						</div>
						<${DrawingCanvas} submitPrompt=${this.submitPromptResponse} />
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
            	#prompt-submit { text-decoration: none; display: inline-block; padding: 10px 30px; background: #0a0; color: #fff; font-size: 30px; }
                #prompt-submit .newgame:hover { background: #000; }
                #prompt-submit .newgame:active { background: #00a; }
                .button-grid { width: 100%; display: grid; grid-template-columns: 1fr 160px; padding-top: 5px; }
            ` + DrawingCanvas.css() + TextInput.css();
        }

    }

    return Prompt;
})



