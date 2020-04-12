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
            //css.load("create-form", CreateForm.css())
        }

        render(props, s) {
            return html`
            <div class="form-container">
                <form id='create-form' onSubmit=${e => this.submit_name(e)}>
                    <div class="form-title" >Pick a name for your game room</div>
                    <input class="text-input" id="game-title-input" type="text"  
                    onInput=${e => this.setState({name: e.target.value})} />
                </form>
                <img class="img carrot" src="/client/assets/carrot.svg" />
            </div>
            `;
        }


        static css() {
            return `
                .form-container { background: #76ba8d; height: 400px; width: 600px; border: 3px solid #000; margin-right: auto; margin-left: auto; display: flex; justify-content: center;}
                .text-input { height: 25px; width: 200px; border: 3px solid #000; text-align: center;} 
                .form-title { margin: 30px;}
                .img.carrot { width: 200px; display: block; }
                form { text-align: center;}
            `
        }

        async submit_name(e) {
            e.preventDefault()
            var slug = this.format_slug(this.state.name, false)
            var slugURL = `${slug}-${Common.uuid(6)}`
            await this.setState({slug: slugURL})
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

