
define(function(require, exports) {
    
    const { Component, render, html, useRef, h } = require('preact');
    const common = require("lib/common");
    const { fonts } = require("components/theme");
    const Events = require("components/events");

    class Post extends Component {
    
        constructor(props) {
            super()
            this.state = {
                text: '',
                name: '',
            }
            if(typeof window !== 'undefined' && window.localStorage) {
                this.state.name = localStorage.getItem('name');
            }
        }

        componentDidMount() {
            this.textarea.focus();
            //this.setState({name: '', text: ''});
        }

        render(props, s) {
            let color = props.color;
            let user = props.user;
            let type_message = "";
            let attempted_text = "";
            let text = s.text;

            let name = s.name;
            
            return html`
                <div class='post-spiel'>
                    <div class='inner'>
                        <form action='/post' id="submit-spiel" onSubmit=${e => this.submit_spiel(e)}>
                            <span class='color my-color' style='background-color: ${ color };'></span>
                            <input type='text' name='name' value='${ name }' placeholder='${ !name ? "Choose a name" : "Name (optional)" }' onInput=${e =>  this.setState({name: e.target.value}) } />
                            <textarea name='spiel' class='type-here' placeholder="Type message" onInput=${e => this.setState({text: e.target.value}) } onKeyDown=${e => this.keydown(e)} tabIndex="0" ref=${r => this.textarea=r} value=${text} />
                            <button type='submit' class='submit' id='submit' title='Send message'><span class="icon-arrow-right-alt1"></span></button>
                        </form>
                    </div>
                </div>
            `
        }

        keydown(e) {
            // enter key
            if (e.keyCode == 13 && !e.shiftKey) {
                this.submit_spiel(e);
            }
        }

        async submit_spiel(e) {
            e.preventDefault();
            var channel = this.props.channel;

            if(channel) {

                var spiel = {
                    name: this.state.name,
                    spiel: this.state.text,
                }
                if(window.localStorage) {
                    localStorage.setItem('name', spiel.name);
                }
                await this.post_spiel({channel, spiel, color: this.props.color});
            }
        }

        async post_spiel({channel, spiel, color}) {

            let uuid = function(length){
                var d = common.now();
                var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.slice(0,length).replace(/[xy]/g, function(c) {
                    var r = (d + Math.random()*16)%16 | 0;
                    d = Math.floor(d/16);
                    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
                });
                return uuid;
            };

            if(channel) {
                var spiel_id = uuid();
                spiel.spiel_id = spiel_id;
                spiel.timestamp = null;
                spiel.editable = null;
                spiel.votes = 0;
                spiel.score = 0;
                spiel.channel = channel;

                // for local msg
                spiel.color = color;

                if (spiel.spiel){
                    this.props.handle_new_spiel({ spiel }); // without timestamp
                    this.setState({text: ''});
                    this.textarea.focus();
                    
                    this.validate_token(async () => {

                        const rawResponse = await fetch("/api/spiels/post", {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({channel, spiel, socketId: 1})
                        });
                        const response = await rawResponse.json();


                        this.props.handle_new_spiel({ spiel: response.spiel });
                    });
                }
            }
        }


        static css() {
            return `
                .post-spiel { position: relative; background: rgba(57, 51, 55, 0.88); width: 100%; box-shadow: 5px 0 5px 0 rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.1); }

                .post-spiel .inner { padding: 7px 10px 7px 10px; position: relative; }

                .post-spiel input, .post-spiel textarea, .post-spiel button { 
                    border: 1px solid transparent;
                    height: 21px;
                    border-radius: 2px;
                    padding: 3px 0;
                    text-indent: 10px;
                    font-family: ${fonts.mono};
                    line-height: 21px;
                    display: inline-block;
                    vertical-align: middle;
                    font-size: 13px;
                    background: #000;
                    color: #ddd;
                    vertical-align: bottom;

                }
                .post-spiel input:disabled, .post-spiel textarea:disabled { opacity: 0.8; }
                .post-spiel textarea.expanding { line-height: 17px; }
                .post-spiel textarea { width: calc(80% - 65px); max-height: 50vh; margin-left: 5px; }
                .post-spiel input[name='name'] { width: 20%; }
                .post-spiel .submit { display: none; }
                .post-spiel .signup-now { color: #333; text-decoration: underline; cursor: pointer; }
                .post-spiel .force-username { cursor: pointer; }


                .post-spiel form { padding-left: 30px; }
                .my-color { 
                    display: inline-block;
                    height: 16px;
                    width: 16px;
                    border-radius: 8px;
                    position: absolute;
                    left: 15px;
                    top: 15px;
                    box-shadow: 0 0 7px rgba(255, 255, 255, 0.2);
                    cursor: pointer; 
                }

                .color .hover-tip { bottom: 20px; left: -18px; display: none; }
                .color:hover .hover-tip { display: block; }

                .post-spiel .panel .action { font-size: 13px; display: inline-block; background: #1F637D; box-shadow: 3px 3px 0 #000; padding: 0 8px; margin: 2px; line-height: 25px; border: none; border-radius: 2px; cursor: pointer; }
                .post-spiel .panel .action:hover { background: #2198C5; }



                .grecaptcha-badge{
                    visibility: collapse !important;  
                }
            `
        }

        load_channel({channel, spiels}) {
            this.state.channel = channel;
            this.find('.type-here').focus();
        }
        validate_token(callback){
            let self = this;
            if(this.state.user) return callback();
            
            let key = '6Lf7zOgUAAAAANljafpjnkghf6x5xvAvqzjYziAY';
            require(['https://www.google.com/recaptcha/api.js?render='+key], (recap) => {
                grecaptcha.ready(() => {
                    grecaptcha.execute(key, {action: 'verify'})
                    .then(async (token) => {
                        const rawResponse = await fetch("/api/auth/recaptcha_token", {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({username: '__anonymous_login', password: token})
                        });
                        const result = await rawResponse.json();
                        console.log("Recaptcaha says", result);

                        if(result.ok){
                            window.logged_in = true;

                            this.setState({user:  result.user});

                            Events.emit("logged_in", result);
                            callback();
                        } else {
                            alert("our site thinks you're a bot. try using a friend's phone");
                        }
                    });
                });
            });
        }

        
    }

    return Post;
})



