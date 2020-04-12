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

        handleSubmit(){
            const { submitPrompt } = this.props;
            const data = { type: 'text', contents: this.state.value }
            submitPrompt(data);
        }

        render(props, s) {
            const { channel } = props;
            const { value } = s;
            return html`
                <div class='main-textarea'>
                	<textarea placeholder="Enter a prompt!" onInput=${this.handleTextChange}>${value}</textarea>
                    <div class="button-grid">
                        <div></div>
	                    <button id='prompt-submit' onClick=${this.handleSubmit}>Submit</button>
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



