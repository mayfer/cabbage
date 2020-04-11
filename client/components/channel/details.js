define(function(require, exports) {
    
    const { Component, render, html, useRef, h } = require('preact');

    class ChannelDetails extends Component {
    
        constructor({state}) {
            super()
            this.state = state;
        }

        render(props, s) {
            return html`
                <div class='channel-details'>
                    <div class='description'>
                        <p>This is where the channel description will go, along with other things like current rules, search & filters, member list, etc.</p>
                    </div>
                    <h4>Members</h4>
                    @murat
                    <h4>Rules</h4>
                    No junk mail
                    <h4>Filters</h4>
                    [Search ]
                </div>
            `
        }


        static css() {
            return `
                .channel-details {

                    border-right: 1px solid rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.8);
                    height: 100%;
                    padding: 15px;
                    font-size: 14px;
                    color: #777;
                }

                .channel-details h4 {
                    color: rgba(255, 245, 255, 0.5);
                    font-size: 19px;
                    font-weight: normal;
                    margin: 10px 0 5px;
                }
            `
        }

        init_client({parent_elem}) {

            let self = this;

            this.attach_to({parent_elem});

        }

        load_channel({channel, spiels}) {
            this.state.channel = channel;
        }
    }

    return ChannelDetails;
})


