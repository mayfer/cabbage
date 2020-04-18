
define(function(require, exports) {
    
    const { Component, render, html, useRef, h } = require('preact');
    const common = require("lib/common");
    const Post = require("./post");
    const { fonts } = require("components/theme");

    class Stream extends Component {
    
        constructor(props) {
            super()
            this.state = {};
            this.state.scrollRef = undefined;
        }

        componentDidMount() {
            this.scrollToBottom();
        }

        render(props, s) {
            return html`
                <div class="channel-stream">
                    <div class="chat hardware-acceleration scroll ${props.narrow ? 'narrow' : ''}" ref=${r => this.scrollRef = r}>
                        <div class='padding'>
                            <div class='inner'>
                                ${props.loading ? html`
                                    <div class='notice'>
                                        Loading...
                                    </div>
                                ` : props.spiels.length > 0 ? 
                                        props.spiels.map((spiel) => this.spiel_template(spiel))
                                        :
                                        html`<div class='notice'>No messages to load in #${props.channel}</div>`
                                }
                            </div>
                        </div>
                    </div>
                    <div class='post-container'>
                        <${Post} ref=${r => this.post=r} narrow=${props.narrow} channel=${props.channel} user=${props.user} handle_new_spiel=${props.handle_new_spiel}  color=${props.color} />
                    </div>
                </div>
                
            `
        }

        spiel_template(spiel) {
            let truncate_threshold = 700;
            let truncate_padding = 50;
            let truncated = spiel.spiel.length > truncate_threshold + truncate_padding;
            let timestamp = parseInt(spiel.timestamp);
        
            return html`
                <div class='row' id='spiel-${spiel.spiel_id}'>
                    <div class="message ${!spiel.timestamp ? `unsent` : ``} ${!truncated ? `truncated` : ``}" id="message-${spiel.spiel_id}" channel="${spiel.channel}">
                        <div class="color-wrap">
                            <div class="color" style="background:${spiel.color}"></div>
                        </div>
                        ${ spiel.name ? 
                            html`<span class="name">[${ common.linkify("", common.htmlentities(spiel.name)) }]</span>`
                            : ``
                        }
                        <span class="spiel-content" vote-count="${ spiel.votes }" editable="${ spiel.editable }" dangerouslySetInnerHTML=${ {__html: common.linkify("", common.htmlentities(spiel.spiel), "_blank")} }></span>
                    </div>
                    <div class='vote-listener vote ${ spiel.voted ? 'voted' : '' } ${ (spiel.votes > 0) ? "show" : "" }'>
                        <span class='vote-count'>${ spiel.votes }</span>
                        <span class='icon-thumbsup'></span>
                    </div>
                    <span class="date">
                        ${ (!spiel.timestamp) ? html`sending...` : html`
                            ${ (spiel.parent_id && spiel.parent_channel && spiel.parent_timestamp) ? html`
                                from
                                <a class="hash" href="/${ spiel.parent_channel }?${ spiel.parent_id }" data-channel="${ spiel.parent_channel }" data-spiel_id="${ spiel.parent_id }">
                                    ${ common.format_channel(spiel.parent_channel) },
                                    <time datetime="${ (new Date(spiel.parent_timestamp)).toISOString() }" timestamp="${ spiel.timestamp }" title="${ common.format_datetime(spiel.parent_timestamp) }">
                                        ${ common.format_datetime(spiel.parent_timestamp) }
                                    </time>
                                </a>
                            ` : html`
                                 <time datetime="${ (new Date(spiel.timestamp)).toISOString() }" timestamp="${ spiel.timestamp }" title="${ common.format_datetime(spiel.timestamp) }">
                                    ${ common.format_datetime(spiel.timestamp) }
                                </time>
                            `}
                        `}
                    </span>
                </div>

                
            `
        }

        static css() {
            return `

                .chat { position: absolute; left: 0; right: 0; bottom: 0; top: 0; overflow: scroll; font-size: 13px; -webkit-overflow-scrolling: touch; -webkit-text-size-adjust: none; overflow-x: hidden; color: #333;  }
                .chat .padding { padding: 20px 0 70px 0;  }
                .chat.narrow .padding { padding: 20px 0 100px 0;  }
                .chat .load-more { display: block; padding: 10px 45px; margin-top: 10px; text-align: center; color: #999; }
                .chat .load-more span { cursor: pointer; color: #931a28; padding: 3px 5px; background: rgba(255, 255, 255, 0.5); }
                .chat .load-more span:hover { background: #fff; }
                .chat .load-more:active { color: #e3eeee; border: none; }
                .chat.truncated { right: 220px; }
                .chat .loading, .chat .load-info { color: #999; font-size: 15px; padding: 20px 0 0 45px; }

                .chat #load-more-controls { padding: 40px 0 10px 0; }

                .chat #load-more-below {
                    padding: 20px 0 10px 0;
                }

                .chat .unsent {opacity: 0.7;}

                .message { cursor: pointer; background: rgba(255,255,255,1); padding: 4px 10px 4px 30px; border-radius: 3px; display: inline-block; margin: 4px 0 0 0;  position: relative; line-height: 18px; min-height: 16px; font-size: 13px; color: #000; max-width: 100%; box-sizing: border-box; }
                .message .spiel-content, .message .name { white-space: pre-wrap; word-wrap: break-word; tab-size: 4; }
                .message .spiel-content { color: #111; outline: none; font-family: ${fonts.mono};}


                .chat .color-wrap { display: inline-block; height: 30px; width: 30px; position: absolute; left: -3px; top: -2px;}
                .chat .color { display: inline-block; height: 16px; width: 16px; border-radius: 8px; position: absolute; left: 5px; top: 5px; box-shadow: 0 0 7px rgba(0,0,0,0.2); }
                .chat .color-wrap .color { left: 7px; top: 7px; }
                .chat .color-wrap .color .hover-tip { bottom: 20px; left: -18px; display: none; }
                .chat .color-wrap .color:hover .hover-tip { display: block; }

                .message:hover{ box-shadow: 0 0 1px rgba(0,0,0,0.4); }
                .row.emphasis { margin: 20px; }
                .emphasis .message { box-shadow: 0 0 1px rgba(0, 0, 0, 0.2); display: block; }
                .row .date { vertical-align: middle; display: inline-block; min-width: 130px; color: #888; font-size: 12px; -webkit-text-size-adjust: none; opacity: 0.6; margin: 1px 0 2px 5px; }
                .row .date a { display: inline-block; text-decoration: normal; background: rgba(255, 255, 255, 0.9); border-bottom: none; border-radius: 2px; padding: 2px 5px;  white-space: nowrap; }
                .row .date a:hover { background: #fff; box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); border: none; color: #a00; }
                .row:hover .date { opacity: 1; color: #666; }
                .row .spiel-content a { color: #a00; border-bottom: 1px solid #a00; }
                .row .spiel-content a:hover { color: #f00; border-bottom: 1px solid #f00; }
                .row .message.shitpost { font-size: 0.8em; opacity: 0.7; line-height: 1.4em; }

                .row a.linkified { color: #fff; border-bottom: 1px solid #666;  }
                .row a.linkified:hover { border-bottom: 1px solid #fff; }

                .message .name { color: rgba(255, 255, 255, 0.5); font-family: ${fonts.mono}; margin-right: 5px; }
                .message .name .hash.at { color: #fff; border: none; text-decoration: none; }
                .message.system .color-wrap { display: none; }
                .message.system {
                    background:#e8e8e8;
                    padding: 10px 15px;
                }

                .message { background: rgba(255,255,255,0.1); }
                .message .spiel-content { color: #bbb;  }
                .row .date a { background: rgba(255, 255, 255, 0.3); color: #faa; }



                .row { position: relative; padding-left: 45px; padding-right: 45px; -webkit-transform: translate3d(0,0,0); }
                .narrow .row { padding-left: 25px; padding-right: 25px; }


                .message.truncated .ellipsis:hover { color: #ce8600; }
                .message.truncated .ellipsis .expand { text-decoration: underline; }
                .message.truncated .ellipsis { display: block; position: absolute; bottom: 0; right: 0; width: 100%; padding: 25px 0 5px 0; background: #fff; color: #986f23; text-align: center; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; box-sizing: border-box; cursor: pointer; font-size: 13px;
                background: linear-gradient(to bottom, rgba(255,255,255,0) 0%,rgba(255,252,244,1) 50%);
                filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00ffffff', endColorstr='#ffffff',GradientType=0 )
                }
                .message .spiel-summary { display: none; }
                .message.truncated .spiel-summary { display: inline; }
                .message.truncated .full-spiel { display: none; }

                .message.truncated .ellipsis {
                background: linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,1) 50%);
                filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00000000', endColorstr='#000000',GradientType=0 );
                }
                .message .ellipsis { display: none; }


                .vote-listener { cursor: pointer; }

                .row .vote-count { display: none; font-size: 15px; font-family: ${fonts.mono}; vertical-align:sub; }
                .row:hover .vote { opacity: 0.2; }
                .row .vote:hover { opacity: 1; color: #333; }
                .emphasis.row .vote { opacity: 1; }
                .emphasis.row:hover .vote { opacity: 1; }

                .row .vote { opacity: 0; position: absolute; top: 0; left: 0; line-height: 35px; font-size: 10px; cursor: pointer; text-align: center; white-space: nowrap; width: 45px; overflow: hidden; }

                @-webkit-keyframes pulsate {
                    0%   { text-shadow: 0 0 0 rgba(0, 0, 0, 0.3); }
                    50%  { text-shadow: 0 0 10px rgba(0, 0, 0, 0.3); }
                    100% { text-shadow: 0 0 0 rgba(0, 0, 0, 0.3); }
                }
                .row .vote.voting, .favorite-spiel.voting, .remove-favorite-spiel.voting {
                    animation: pulsate 0.4s ease-out infinite;
                }
                .row .vote.show { opacity: 1; }
                .row .vote .icon-thumbsup { font-size: 15px; vertical-align: sub; }
                .row.show-votes .vote { opacity: 1; }

                .row .vote { color: #666; }
                .row:hover .vote { opacity: 0.5; }
                .row .vote.voted { color: #fff; }
                .row .vote:hover { color: #aaa; }
                .row .vote:hover.voted { color: #fff; }



                .post-container { position: absolute; bottom: 0; left: 0; right: 0; }

                .chat .notice {
                    margin: 0 30px;
                    font-size: 15px;
                    color: #555;
                }
            ` + Post.css();
        }

        animateToBottom() {
            let scrollTo = (to, duration) => {
                let element = this.scrollRef;
                //t = current time
                //b = start value
                //c = change in value
                //d = duration
                let easeInOutQuad = function (t, b, c, d) {
                  t /= d/2;
                    if (t < 1) return c/2*t*t + b;
                    t--;
                    return -c/2 * (t*(t-2) - 1) + b;
                };
                let start = element.scrollTop,
                    change = to - start,
                    currentTime = 0,
                    increment = 20;
                    
                let animateScroll = function(){        
                    currentTime += increment;
                    var val = easeInOutQuad(currentTime, start, change, duration);
                    element.scrollTop = val;
                    if(currentTime < duration) {
                        setTimeout(animateScroll, increment);
                    }
                };
                animateScroll();
            }
            let scroller = this.scrollRef;

            scrollTo(scroller.scrollHeight, 300);

        }

        scrollToBottom() {
            let scroller = this.scrollRef;
            scroller.scrollTop = scroller.scrollHeight;
        }

    }

    return Stream;
})


