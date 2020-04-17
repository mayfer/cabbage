define(function(require, exports) {
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    class TextInput extends Component {
        constructor(props) {
            super();
            let channel = props.channel;
            this.state = {
                value: '',
            };
            this.handleTextChange = this.handleTextChange.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);

        }

        componentDidMount() {

        }

        componentWillUnmount() {

        }

        componentShouldUpdate(){

        }

        handleTextChange(e){
            e.preventDefault();
            this.setState({ value: e.target.value })
        }

        handleSubmit({close_round=false}){
            const { submitPrompt } = this.props;
            submitPrompt({ type: 'caption', contents: this.state.value, close_round });
        }

        render(props, s) {
            const { channel, round } = props;
            const { value } = s;
            return html`
                <div class='main-textarea'>
                	<textarea placeholder="${props.round ? "Caption the drawing" : "Type a drawing prompt, anything you like"}" onInput=${this.handleTextChange}>
                        ${value}
                    </textarea>
                    <div class="button-grid">
                        <div class="submit-area">
                            ${round && round.count >= round.settings.min_turns-1 ? html`
                                <button class='prompt-submit' onClick=${e => this.handleSubmit({close_round: true})}>Submit, close & reveal round ⮕</button>
                                <br />
                                <button class='prompt-submit' onClick=${e => this.handleSubmit({})}>Submit & leave round open ⮕ </button>
                            ` : html`
                                <button class='prompt-submit' onClick=${e => this.handleSubmit({})}>Submit</button>
                            `}
                        </div>
                    </div>
                </div>
            `
        }

        static css() {
            return `
            	.main-textarea { width: 100%; display: flex; align-items: center; flex-flow: column;}
            	.main-textarea textarea { width: 100%; height: 300px; resize: none; border: 2px solid black; font-size: 30px; padding: 20px; box-sizing: border-box;}
            	.main-textarea textarea:focus { outline: none; }
            `;
        }

    }

    return TextInput;
})



