define(function(require, exports) {
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const { fonts } = require("components/theme");
    const Router = require("components/router");
    const API = require("components/api");

    return class CreateForm extends Component {
        constructor(props) {
            super();
            this.state = {busy: false};
            //css.load("create-form", CreateForm.css())
        }

        componentDidMount(){
            this.input.focus()
        }

        render(props, s) {
            return html`
                <div class="create form-container">
                    <form class='create-form' onSubmit=${e => this.submit_name(e)}>
                        <div class="form-title" >Pick a name for your game room</div>
                        <input class="text-input" id="game-title-input" type="text" onInput=${e => this.setState({name: e.target.value})} placeholder="e.g. Adams Family Cabbage House"
                        ref=${r => this.input=r}/>
                        <br />
                        <button type="submit" ${s.busy ? 'disabled' : ''}>Create Room</button>
                        <br />
                        <img class="img carrot" src="/client/assets/carrot.svg" />
                    </form>
                </div>
            `;
        }


        static css() {
            return css.add_parents('.create.form-container', `
                { font-size: 24px; display: inline-block; background: #9ad6af; width: 600px; border: 20px solid #fff; border-radius: 5px; box-shadow: 0 0 50px 0 rgba(0, 0, 0, 0.2); margin: 60px auto; display: block;  }
                .text-input { font-size: 18px; padding: 10px; line-height: 20px; width: 300px; border: 3px solid #000; } 
                .text-input:focus { border-color: #03f; }
                button { display: inline-block; padding: 10px 30px; margin: 10px; background: #0a0; color: #fff; font-size: 30px; cursor: pointer; border: none; }
                #game-title-input { text-align: center; outline: none;}
                #game-title-input:focus { border: 3px solid #000;}
                button:active { background: #3a0; }
                .form-title { margin: 20px;  }
                .img.carrot { margin: 30px 0; width: 400px; display: inline-block; }
                .create-form { text-align: center;  }
            `);
        }

        async submit_name(e) {
            e.preventDefault()

            
            this.setState({busy: true});
            let {channel} = await API.request({method: "post", url: "/api/cabbage/channel/create", body: {title: this.state.name}});
            this.setState({busy: false});

            var url = `lobby/${channel.slug}`
            Router.navigate(url)
        }
    }
});

