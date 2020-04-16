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
                count: 6,
            };
            this.submitFirstPrompt = this.submitFirstPrompt.bind(this)
            this.submitPromptResponse = this.submitPromptResponse.bind(this)
            this.randindex = Math.round(Math.random() * 3);
        }

        componentDidMount() {
        }

        componentWillUnmount() {
        }

        componentShouldUpdate(){
        }

        async submitFirstPrompt(data){
            const { channel } = this.props; 
            const {type, contents} = data;
            this.props.loadingHandler({loading: true});
            const turn_res = await API.request({method: "post", url: "/api/round/create", body: { type, contents, channel }})
            this.props.loadingHandler({loading: false});
            if (turn_res.ok) {
                Router.navigate(`/lobby/${channel.slug}`)
            } else {
                alert("error")
            }
        }

        async submitPromptResponse(data){
            const { channel, round } = this.props; 
            const previous_turn_id = round.last_turn.id;
            const {type, contents} = data;

            const body = { type, contents, channel, round_id: round.id, previous_turn_id }

            this.props.loadingHandler({loading: true});
            const turn_res = await API.request({method: "post", url: "/api/turn/create", body})
            this.props.loadingHandler({loading: false});
            if (turn_res.ok) {
                Router.navigate(`/lobby/${channel.slug}`)
            } else {
                alert("error")
            }
        }

        render(props, s) {
            const { mode, prompt, channel, round } = props;
            const imagefile = [
                html`<img class="decor" src="/client/assets/potatoandonion.svg" style="width: 60%; margin-top: 0px; float: right;" />`,
                html`<img class="decor" src="/client/assets/fruzzyguy.svg" style="width: 60%; display: block; margin: 40px auto;" />`,
                html`<img class="decor" src="/client/assets/radish.svg" style="width: 40%; margin-top: 40px; float: right;" />`,
                html`<img class="decor" src="/client/assets/sealion.svg" style="width: 60%; margin-top: 40px;" />`,
            ][this.randindex];
            return html`
            	<div id="prompt-container">
                    ${round ? html`` : html`
                        <div id="rounds-input-wrapper" >
                            Choose a <strong>minimum number of turns</strong> before reveal:
                            <input id="rounds-count-input" type="number" min="2" value="${this.state.count}" onInput=${e => this.setState({count: e.target.value})} />
                        </div>
                    `}
					${mode === 'draw' ? html`
                        Draw something
						<${DrawingCanvas} submitPrompt=${this.submitFirstPrompt}/>
					` : ''}
					${mode === 'text' ? html`
						<${TextInput} submitPrompt=${this.submitFirstPrompt}/>
                        
					` : ''}
					${mode === 'textAsResponse' ? html`
						${round && round.last_turn && round.last_turn.type == 'drawing' ?  html`
                            <strong>${round && round.last_turn ? round.last_turn.username : ''}</strong>'s drawing for you to caption:
                            <div class="drawing-frame">
                                <img src=${round.last_turn.contents} id="prompt-image" />
                            </div>
                        ` : ``}
						<${TextInput} round=${round} submitPrompt=${this.submitPromptResponse} />
                        
					` : ''}
					${mode === 'drawAsResponse' ? html`
						<div id='text-prompt-wrapper'>
                            <strong>${round && round.last_turn ? round.last_turn.username : ''}</strong>'s prompt for you to draw:
							<h2 class='prompt'>
                                ${round && round.last_turn && round.last_turn.type == 'caption' ? round.last_turn.contents : ''}
                            </h2>
						</div>
						<${DrawingCanvas} round=${round} submitPrompt=${this.submitPromptResponse} />
					` : ''}

                    ${imagefile}
				</div>
            `
        }

        static css() {
            return `
                .drawing-frame { background: #fff; border: 3px solid #aaa; }
                h2.prompt { color: #000; }
            	#prompt-container {
            		padding-top: 20px;
            	}
            	#prompt-image {
            		width: 100%;
            	}
            	#text-prompt-wrapper h2 { 
            		background: rgba(255, 255, 255, 0.3); padding: 20px; margin: 5px 0;
            	}
            	#prompt-submit { text-decoration: none; display: inline-block; padding: 10px 30px; background: #0a0; color: #fff; font-size: 30px; }
                #prompt-submit .newgame:hover { background: #000; }
                #prompt-submit .newgame:active { background: #00a; }
                .button-grid { width: 100%; display: grid; grid-template-columns: 1fr 160px; padding-top: 5px; }


                #rounds-count-input { margin-left: 10px; text-align: center; border: none !important; background: #eee; line-height: 25px; font-size: 15px; border: 1px solid #000; width: 50px;}
                #rounds-count-input:focus { outline:none !important; outline-width: 0 !important; box-shadow: none; -moz-box-shadow: none; -webkit-box-shadow: none;}
                #rounds-input-wrapper { margin: 20px 0; font-size: 17px; }
            ` + DrawingCanvas.css() + TextInput.css();
        }

    }

    return Prompt;
})



