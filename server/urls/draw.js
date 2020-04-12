
const rfr = require('rfr');
const common = rfr('/client/lib/common.js');

const { redis } = rfr('/server/connections');

const es = rfr('/server/services/spiels/es');

const user_actions = rfr('/server/services/users/actions');
const user_queries = rfr('/server/services/users/queries');

const fetch = require('node-fetch');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const { render: render_preact } = require('preact-render-to-string');
const Root = rfr('/client/components/root.js');
const Layout = rfr('/client/components/layout.js');
const { html } = rfr('/client/core/preact-htm-umd.js');
const credentials = rfr('/credentials.json');


passport.use(new LocalStrategy({
        passReqToCallback:true,
    },
    async function(req, username, password, done) {
        if(username == '__anonymous_login') {
            const token = password;
            const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const secret = credentials.recaptcha.secret;
            const url = 'https://www.google.com/recaptcha/api/siteverify?secret='+ secret +'&response=' + token + '&remoteip=' + ip_address;
            const responseRaw = await fetch(url, {
                method: 'GET',
            });
            const response = await responseRaw.json();

            
            const anon_score = response.score;
            if (anon_score > 0.5) {
                const request_headers = req.headers;
                const ip = ip_address;
                const user = await user_actions.create_anon_user({anon_score, ip, request_headers});

                return done(null, user);
            } else {
                return done(null, false, { message: 'You might be a bot, anonymous login rejected.' });
            }
        } else {
            return done(null, false, { message: 'Regular login not implemented yet.' });
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.public_id);
});

passport.deserializeUser(async function(public_id, done) {
    const user = await user_queries.get_user({public_id});
    done(null, user);
});

function genColor (seed) {
    let color = Math.floor((Math.abs(Math.sin(seed) * 16777215)) % 16777215);
    color = color.toString(16);
    // pad any colors shorter than 6 characters with leading 0s
    while(color.length < 6) {
        color = '0' + color;
    }
    
    return color;
}

module.exports = function({app, io, websockets}) {

    app.get("/?", function(req, res){
        let props = {page: 'home'};
        res.send(Root(render_preact(html`<${Layout} ...${props} />`), props));

    });
    app.get("/newgame/?", function(req, res){
        let props = {page: 'newgame'};
        res.send(Root(render_preact(html`<${Layout} ...${props} />`), props));

    });
    app.get("/lobby/:channel([^/]+)(/?)", passport.authenticate('session'), async function(req, res) {
        // console.log("session", req.session)
        let {user} = req;
        let {channel} = req.params;
        if(!channel) channel = 'index';
        
        let seed = parseInt(("1"+(req.headers['x-forwarded-for'] || req.connection.remoteAddress)).replace(/[^0-9]/g, ''));

        let color = "#"+genColor(seed);

        req.session.color = color;

        let { results: initial_spiels } = await es.filter({
            channel,
            filters: {},
        });

        let props = {channel, color, initial_spiels, user, page: 'channel'};

        res.send(Root(render_preact(html`<${Layout} ...${props} />`), props));
    });

    app.post("/api/channel", async function(req, res){
        const {slug} = req.query;
        const channel = await cabbage.get_channel({slug});
        res.json({channel});
    });
    app.post("/get", async function(req, res){
        let polygons = await redis.get("polygons");
        res.json({polygons});
    });

    app.post("/api/spiels/post", passport.authenticate('session'), async function(req, res){
        let { spiel } = req.body;

        spiel.timestamp = common.now();
        await es.add_spiel_to_elasticsearch({spiel});

        websockets.send_to_channel({channel: spiel.channel, type: "spiel", message: {spiel}});

        res.json({spiel});
        
    });

    app.post('/api/auth/recaptcha_token', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) { return next(err);  }
            if (!user) { return res.json({ok: false, info}); }
            req.login(user, function(err) {
                if (err) { return next(err); }
                return res.json({ok: true, user});
            });
        })(req, res, next);
    });
    

}

