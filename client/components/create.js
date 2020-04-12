define(function(require, exports) {
    const css = require('core/css')
    const { Component, render, html, useRef, h } = require('preact');

    const Common = require("lib/common");
    const { fonts } = require("components/theme");
    const Router = require("components/router");


    return class CreateForm extends Component {
        constructor(props) {
            super();
            this.state = {};
            //css.load("create-form", CreateForm.css())
        }

        render(props, s) {
            return html`
            <div class="create form-container">
                <form class='create-form' onSubmit=${e => this.submit_name(e)}>
                    <div class="form-title" >Pick a name for your game room</div>
                    <input class="text-input" id="game-title-input" type="text" onInput=${e => this.setState({name: e.target.value})} placeholder="e.g. Adams Family Cabbage House" />
                    <br />
                    <button type="submit">Create room</button>
                    <br />
                    <img class="img carrot" src="/client/assets/carrot.svg" />  
                </form>
            </div>
            `;
        }


        static css() {
            return css.add_parents('.create.form-container', `
                { font-size: 20px; margin: 30px; display: inline-block; background: #9ad6af; width: 600px; border: 20px solid #fff; border-radius: 5px; box-shadow: 0 0 50px 0 rgba(0, 0, 0, 0.2); }
                .text-input { font-size: 18px; padding: 10px; line-height: 20px; width: 300px; border: 3px solid #000; } 
                .text-input:focus { border-color: #03f; }
                button { font-size: 18px; display: inline-block; cursor: pointer; background: #000; color: #fff; }
                button:active { background: #3a0; }
                .form-title { margin: 20px;  }
                .img.carrot { margin: 30px 0; width: 500px; display: inline-block; }
                .create-form { text-align: center; }
            `);
        }

        async submit_name(e) {
            e.preventDefault()
            var slug = this.format_slug(this.state.name, false)
            var slugURL = `${slug}-${Common.uuid(6)}`
            await this.setState({slug: slugURL})
            this.props.setLobbyDetails({lobbyName: this.state.name, lobbySlug: this.state.slug})
            var url = `lobby/${this.state.slug}`
            Router.navigate(url)
        }

        format_slug(text, keep_trailing_space) {
            var slug = text.trim().toLowerCase().split(' ').join('-');
            slug = slug.replace(/[^A-Za-z0-9-]/g,'').replace(/\s/g,'').replace(/\-{2,}/g,'-');
            if(!keep_trailing_space) {
                slug = slug.replace(/-$/,'');
            }
                return slug;
        }
    }
});

