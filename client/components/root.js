define(function(require, exports) {

    const Common = require("lib/common");

    const Layout = require("components/layout");
    const Header = require("components/header");
    const Channel = require("components/channel/channel");

    const css_preloads = [
        {
            name: 'Layout',
            css: Layout.css()
        },
    ];

    return (Layout, props) => {
        return `
            <!doctype html>
            <html>
                <head>
                    <meta charset='utf-8' />
                    <title>Cabbage (af) &bull; the drawing game</title>
                    <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />
                            
                    <link href='https://fonts.googleapis.com/css?family=PT+Mono' rel='stylesheet'  type='text/css' />
                    <link href='https://fonts.googleapis.com/css?family=PT+Sans:400,700' rel='stylesheet'  type='text/css' />
                        
                    <style type="text/css" id="css-Root">
                        body, html { height: 100%; margin: 0; padding: 0; position: relative; overflow: hidden; -webkit-text-size-adjust: none; text-rendering: optimizeLegibility;  -webkit-font-smoothing: subpixel-antialiased;  -webkit-tap-highlight-color: rgba(0,0,0,0); }

                        body { background: #f9d49c; }
                    </style>

                    ${css_preloads.map( c => `
                        <style type="text/css" id="css-${c.name}">
                            ${c.css}
                        </style>
                    `).join("\n")}
                     
                </head>
                <body>
                    ${Layout}

                    <script type="text/javascript">
                        window.addEventListener('DOMContentLoaded', function(event) {
                            var chat_elem = document.querySelector('.chat.scroll');
                            if(chat_elem) chat_elem.scrollTop = chat_elem.scrollHeight + chat_elem.clientHeight;

                            var type_elem = document.querySelector('#submit-spiel .type-here');
                            if(type_elem) type_elem.focus();
                        });
                    </script>
                    <script src="/client/core/require.min.js"></script>
                    <script src="/client/lib/jquery.slim.min.js"></script>
                    <script type="text/javascript">
                        (function() {
                            /* browser-only javascript, ignored for server-side text-rendering */

                            var js_base_url = '/client/';
                            var entry_points = ["preact", "components/layout", "core/preact-umd", "core/htm-umd",];

                            window.env = {
                                name: 'dev',
                            }

                            requirejs.config({
                                baseUrl: js_base_url,
                                paths: {
                                    'preact': "core/bundle",
                                    'mapbox': "https://api.tiles.mapbox.com/mapbox-gl-js/v1.5.0/mapbox-gl",
                                    'mapbox-gl-draw': "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.0.9/mapbox-gl-draw",
                                    'mapbox-geocoder': "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.0/mapbox-gl-geocoder.min",
                                    'turf': "components/map/turf.min",
                                    'jquery' : 'lib/jquery.slim.min',
                                }
                            });

                            require(entry_points, function(Preact, Layout){

                                var props = ${Common.script_safe_json(props)};
                                
                                var layout = Preact.h(Layout, props);
                                var replace = document.querySelector("#layout")
                                Preact.hydrate(layout, replace.parentElement);

                                if(window.env.name == 'dev') {
                                    window.layout = layout;
                                }

                            });
                        })();
                    </script>
                </body>

            </html>
        `
    }
})

