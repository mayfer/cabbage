define(function(require, exports) {
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const { fonts } = require("components/theme");
    const Router = require("components/router");


    return class CreateForm extends Component {
        constructor(props) {
            super();
            console.log("init create", props)
            this.state = {};
            css.load("create-form", CreateForm.css())
        }

        render(props, s) {
            return html`
            <div class="form-container">
                <form id='create-form' onSubmit=${e => this.submit_name(e)}>
                    <div class="form-title" >Pick a name for your game room</div>
                    <input class="text-input" id="game-title-input" type="text"  
                    onInput=${e => this.setState({name: e.target.value})} />
                </form>
            </div>
            `;
        }


        static css() {
            return `
                .form-container { background: #76ba8d; height: 400px; width: 600px; border: 3px solid #000; margin-right: auto; margin-left: auto; display: flex; justify-content: center;}
                .text-input { height: 25px; width: 200px; border: 3px solid #000; text-align: center;} 
                .form-title { margin: 30px;}
                form { text-align: center;}
            `
        }

        async submit_name(e) {
            e.preventDefault()
            console.log(e)
            Router.navigate("/lobby/howto")
        }

                            // you entered: ${s.name}

    }
});

