
let redis = {

    set_socket_session: function(socketId, session_object) {
        var session_object = JSON.stringify(session_object);
        await cash_redis.set(`socket_session:${socketId}`, session_object)
        await redis_client.expire(`socket_session:${socketId}`, 60 * 60 * 24);
    },

    delete_socket_session: function(socketId, callback){
        redis_client.del(`socket_session:${socketId}`);
        if (callback) callback();
    },

    get_socket_session: function(socketId, callback){
        cash_redis.get(`socket_session:${socketId}`, (result)=>{
            var session_object = JSON.parse(result);
            callback(session_object);
        })
    },

    add_to_room: function(channel, session, socket, callback){
        var session_json = JSON.stringify(session);
        await redis_client.set(["channel:"+channel+":"+session.id, session_json]);
        await redis_client.expire("channel:"+channel+":"+session.id, TTL);
    },

    delete_from_room: function(channel, session_id, callback){
        await redis_client.del(["channel:"+channel+":"+session_id]);
    },

    push_socket: function(session_id, socket_id){
        await redis_client.set(["sockets:"+session_id+":"+socket_id, socket_id]);
        await redis_client.expire("sockets:"+session_id+":"+socket_id, TTL);
    },

    push_user_socket: function(user_id, socket_id) {
        await redis_client.set(["user_sockets:"+user_id+":"+socket_id, socket_id]);
        await redis_client.expire("user_sockets:"+user_id+":"+socket_id, TTL);
    },

    get_user_sockets: function(user_id, callback){
        let keys = await redis_client.keys(["user_sockets:"+user_id+":*"]);
        let results = await redis_client.mget(keys);
        if (results) {
            return results;
        } else {
            return [];
        }
    },

    get_sockets: function(session_id, callback){
        let keys = await redis_client.keys(["sockets:"+session_id+":*"]);
        let results = redis_client.mget(keys, function(err, results){
        if (results) {
            return results;
        } else {
            return [];
        }
    },


    update_active: function(user_id){
        await redis_client.set("active:"+user_id, 1);
        await redis_client.expire("active:"+user_id, TTL);
    },

    is_active: function(user_id, callback){
        let result = await redis_client.get("active:"+user_id0);
        return (result == 1);
    },

    get_active: function(callback){
        let keys = await redis_client.keys(["active:*"]);
        return keys.map(function(key){
            return parseInt(key.split(':')[1]);
        });
    },

    set_subscription_channels: function(channels, type, callback){
        await redis_client.set(type, JSON.stringify(channels));
    },

    get_subscription_channels: function(type, callback){
        let results = await redis_client.get(type);
        if (results) {
            return JSON.parse(results);
        } else {
            return null;
        }
    },

    client: redis_client,

    quit: function () {
        redis_client.quit();
    }
}



////////////////////////


var db = require('./db');
var version = require('./version').version;
var common = require('./public/js/common.js');
var redis = require('./redis.js');
const redis_client = require('./connections').redis;

var last_socket_lists = {};

var server_id = argv.server_id;

function is_current_room (room) {
    return room.match(/^current\:/);
}

function is_subscription_room (room) {
    return room.match(/^subcsription\:/);
}


function get_rooms(channel, get_all_rooms, get_subscriptions, callback) {
    if (get_all_rooms || channel == '' || !channel) {
        io.of('/').adapter.allRooms((err, rooms)=>{
            var rooms = rooms.filter((room)=>{
                return is_current_room(room);
            });
            return callback(rooms)
        });
    }
    else {
        let formatted_channel;
        if (get_subscriptions) {
            formatted_channel = format_subscription_channel(channel);
        } else {
            formatted_channel = format_current_channel(channel);
        }
        return callback([formatted_channel]);
    }
}

function get_sessions(rooms, callback) {
    io.of('/').adapter.clients(rooms, function(err, socketIds){
        var sessions = [];
        var s_checked  = 0;
        var s_to_check = socketIds.length;
        if (s_to_check == 0) {
            return callback(sessions);
        }
        socketIds.forEach((id)=>{
            redis.get_socket_session(id, function(session){
                if (session) sessions.push(session);
                s_checked++;
                if (s_checked == s_to_check) {
                    return callback(sessions);
                }
            });
        });
    });
}

function prepare_sessions(sessions, callback) {
    sessions.forEach(function(session){
        session.user_id = session.user_id ? parseInt(session.user_id) : null;
    })
    var sessions = sessions.filter(function(session){
        return session != null;
    });
    redis.get_active(function(actives){
        sessions.forEach(function(session, i){
            sessions[i].active = actives.indexOf(session.user_id) != -1
        });
        return callback(sessions)
    });
}

function sort_sessions (sessions) {
    return sort_named_users(sessions).concat(unnamed_users(sessions));
}

function prepare_private_sessions(sessions, channel, callback) {
    db.slave.users.get_private_room_users(channel, function(all_users){
        var online_user_ids = sessions.map(function(session){ return session.user_id; });
        var offline_users = all_users.filter(function(user_id){
            return online_user_ids.indexOf(user_id) == -1;
        });
        db.slave.sessions.get_sessions_for_user_ids(offline_users, channel, function(offline_sessions){
            if(offline_sessions && offline_sessions.length > 0) {
                offline_sessions.forEach(function(session,i){
                    offline_sessions[i].offline = true;
                });
            } else {
                offline_sessions = [];
            }
            // var new_sessions = sessions.concat(offline_sessions);
            // var new_sessions = sort_sessions(sessions.concat(offline_sessions))

            return callback(sort_sessions(sessions.concat(offline_sessions)));
        });
    });
}

function get_online(channel, final_callback, get_all_rooms, get_subscriptions) {
    get_rooms(channel, get_all_rooms, get_subscriptions, function(rooms){
        get_sessions(rooms, function(sessions){
            prepare_sessions(sessions, function(sessions){
                sessions = remove_duplicate_objects(sessions, "public_id");
                if (channel && channel[0] == '.') {
                    prepare_private_sessions(sessions, channel, function(private_sessions){
                        return final_callback(private_sessions);
                    });
                }
                else {
                    sessions = sort_sessions(sessions);
                    return final_callback(sessions);
                }
            });
        });
    });
}
function get_unique_online(channel, callback) {
    get_online(channel, function(sessions){
        var dupes = {};
        for(var i=0; i<sessions.length; i++) {
            if(dupes[sessions[i].public_id] === undefined) {
                dupes[sessions[i].public_id] = false;
            } else {
                dupes[sessions[i].public_id] = true;
            }
        }

        var users = sessions.filter(function(sess) {
            return dupes[sess.public_id] != true;
        });

        return callback(users);
    });
}

function get_subscription_users (room, callback) {
    get_online(room, callback, null, "GET SUBSCRIPTION CHANNEL USERS");
}

function sort_named_users(users){
    return users.filter(function(user){
        return user.name != "" && user.name !== undefined && user.name !== null;
    }).sort(function(a,b){
        // sort names alphabetically
        name1 = a.name.toLowerCase();
        name2 = b.name.toLowerCase();
        if(name1 < name2) return -1;
        if(name1 > name2) return 1;
        return 0;
    });
}

function unnamed_users(users){
    return users.filter(function(user){
        return user.name == "" || user.name == undefined || user.name == null;
    });
}

var channel_objects = function(io){
    return io.nsps['/'].adapter.rooms;
};

var format_subscription_channel = function(channel){
    return "subscription:"+channel.toLowerCase();
};

var format_current_channel = function(channel){
    const chan = channel && channel.toLowerCase()
    return "current:"+chan
};

var get_session_from_socket = function(io, socketId){
    return io.sockets.connected[socketId].session;
}

var get_socket_id_from_session = function(io, session_id){
    var sockets = []
    for (socketId in io.sockets.connected) {
        var sock = io.sockets.connected[socketId];
        if (sock.session && session_id == sock.session.id ) {
            sockets.push(socketId);
        }
    }
    return sockets
}

var send_to_user = function(user_id, message, data){
    io.to(`user:${user_id}`).emit(message, data);
}


var send_vote_info = function({channel, spiel_id, votes, score, author_id}){
    io.in(format_current_channel(channel)).emit('vote_update', { spiel_id, votes, score });
    send_to_user(author_id, 'vote_update', { spiel_id, votes, score });
};


var remove_duplicate_objects = function(array, compare_value){
    array.sort( function( a, b){ return a[compare_value] - b[compare_value]; } );

    for( var i=0; i<array.length-1; i++ ) {
        if ( array[i][compare_value] == array[i+1][compare_value] ) {
            delete array[i];
        }
    }

    return array.filter( function( el ){ return (typeof el !== "undefined"); } );
}

var post_as_bot = function({ bot_type, channel, message, handle, name, props, poll }) {
    if(bot_type == 'sedi' || bot_type == 'sedar') handle = "@sedi";
    if(bot_type == 'sedar') name = "SEDAR bot";

    var spiel = {
        name: name,
        session: null,
        channel: channel,
        spiel: message,
        spiel_id: common.uuid(12),
        timestamp: Date.now(),
        editable: false,
        votes: '0',
        featured: false,
        verified: false,
        fake: false,
        bot: bot_type,
        color: 'black',
        props,
        poll,
    }

    db.users.find_handle(handle, function(bot_user){
        // var user_id = bot_user.id;
        db.spiels.post_spiel(channel, spiel, bot_user, function(db_id){
            push_spiel({channel, sender_user: bot_user, spiel, socketId: null});
            copy_hash_spiels(io, spiel, bot_user);
        });
    });
}

var system_message = function(channel, message, props, poll, as_handle) {
    var spiel = {
        name: '@admin',
        session: null,
        channel: channel,
        spiel: message,
        spiel_id: common.uuid(12),
        timestamp: Date.now(),
        editable: false,
        votes: '0',
        featured: false,
        verified: false,
        fake: false,
        bot: 'admin',
        color: 'black',
        props,
        poll,
    }

    db.users.find_handle(spiel.name, function(admin_user){
        // var user_id = admin_user.id;
        db.spiels.post_spiel(channel, spiel, admin_user, function(db_id){
            push_spiel({channel, sender_user: admin_user, spiel, socketId: null});
            copy_hash_spiels(io, spiel, admin_user);
        });
    });
}

var child_system_message = function({channel, message, parent_id, props, poll}) {
    var spiel = {
        name: '@admin',
        session: null,
        channel,
        spiel: message,
        parent_id,
        spiel_id: common.uuid(12),
        timestamp: Date.now(),
        editable: false,
        votes: '0',
        featured: false,
        verified: false,
        fake: false,
        bot: 'admin',
        color: 'black',
        props,
        poll,
    }

    db.users.find_handle(spiel.name, function(admin_user){
        // var user_id = admin_user.id;
        db.spiels.post_spiel(channel, spiel, admin_user, function(db_id){
            push_spiel({channel, sender_user: admin_user, spiel, socketId: null});
            copy_hash_spiels(io, spiel, admin_user);
        });
    });
}

var post_spiel_to_channel = async function({ io, channel, spiel, sender_user, socketId, penalized, ip, props }, callback) {
    if (!sender_user.admin) {
        await check_ip({ user: sender_user, ip });
    }

    if (props) spiel.props = props

    db.spiels.post_spiel(channel, spiel, sender_user, function(db_id){
        push_spiel({channel, sender_user, spiel, socketId});

        copy_hash_spiels(io, spiel, sender_user, penalized);

        if (callback) {
            spiel.source_id = db_id;
            callback(null, spiel);
        }
    });
};

const notify_channel_event = async function({channel, event_type, timestamp}) {

    io.to(format_subscription_channel(channel)).emit('new_channel_event', {
        channel,
        event_type,
        timestamp
    });
};


async function check_ip ({ user, ip }) {
    if (!ip) return;

    const handle = user.handle || user.name;
    const set_name = `user_ip:${ip}`;

    // add handle to ip set and expire
    await redis.client.sadd(set_name, handle);
    await redis.client.expire(set_name, 86400); // expire in a day (seconds)

    // get content of the set
    const handles = await redis.client.smembers(set_name);

    // if only one user attributed to the ip, return
    if (handles.length <= 1) return;

    // check if the user has been warned
    const warning_flag_key_name = `ip_warning_sent:${set_name}`;
    const warned = await redis.client.get(warning_flag_key_name);

    if (warned) return;

    // set warned flag on redis
    await redis.client.set(warning_flag_key_name, 1);
    await redis.client.expire(set_name, 86400 / 2); // expire in half a day (seconds)

    const user_agent_1 = await db.slave.users.get_latest_spiels_user_agent_by_handle(handles[0]);
    const user_agent_2 = await db.slave.users.get_latest_spiels_user_agent_by_handle(handles[1]);

    // alert team through .ip_check_bot
    const channel = '.ip_check_bot';
    const message = `User ${handle} has multiple handles on same ip (${ip}): ${handles.join(', ')}.

User Agents:
    ${handles[0]}: ${user_agent_1}
    ${handles[1]}: ${user_agent_2}`;

    return system_message(channel, message);
}

var copy_spiel_to_channel = async function(channel, parent_id, sender_user, socketId){
    if(sender_user && !sender_user.admin && sender_user.reputation < 50) {
        // murat TODO: this gets REPEATED in copy_hash_spiels or whatever, need to refactor all of spiel posting code
        let posting_limit = await redis_client.get(`daily_posting_limit:${channel}`);
        let remaining_spiels;
        if(posting_limit) {
            posting_limit = parseInt(posting_limit);
            let since = common.now() - 1000*60*60*16;

            let num_posts = await db.spiels.get_number_of_spiels_by_user({user_id: sender_user.id, channel, since});

            if(num_posts >= posting_limit) {
                // don't copy, limit passed
                return undefined;
            }
        }
    }

    if(!db.channels._channel_is_custom(channel)) {
        db.spiels.get_spiel_by_spiel_id(parent_id, function(spiel_obj) {
            var original_channel = spiel_obj.channel;
            var source_id = spiel_obj.source_id;

            // if the edited spiel is already a child of a parent, make sure the new child points to the parent
            if(spiel_obj.parent_id && spiel_obj.parent_channel) {
                original_channel = spiel_obj.parent_channel;
                parent_id = spiel_obj.parent_id;
            }

            if(original_channel.toLowerCase() == 'hotpeck' && channel[0] != '@') {
                // ignore, don't post to other channels
            } else {
                db.spiels.post_channel_spiel(channel, source_id, null, parent_id, function(channel_spiel){
                    db.spiels.get_spiel_by_db_id(source_id, function(spiel_obj){
                        var other_spiel = dto.make_child_spiel(dto.spiel(spiel_obj), channel);
                        other_spiel.spiel_id = channel_spiel.spiel_id;
                        other_spiel.parent_id = channel_spiel.parent_id;
                        other_spiel.parent_channel = original_channel;
                        other_spiel.parent_timestamp = spiel_obj.timestamp;
                        other_spiel.timestamp = common.now();
                        push_spiel({channel, sender_user, spiel: other_spiel, socketId: null});
                    });
                }, channel == "featured", null, sender_user ? sender_user.id : null);
            }
        });
    }
}

// distributes a spiel to channels it references
// (either through #, @, or $ refs)
var copy_hash_spiels = async function(io, spiel, sender_user, penalized) {
    var original_channel = spiel.parent_channel ? spiel.parent_channel : spiel.channel;

    var string = (spiel.name + " " + spiel.spiel);
    var hash_tags = []

    var handleMatches = function(regex, string) {
        var match;
        while(match = regex.exec(string)) {
            var type = match[2];
            var channel = match[3];

            if(type == "@" || type == "~") {
                channel = type + channel;
            }

            const own_channel = sender_user && (channel === (sender_user.handle || sender_user.name))
            if (!penalized || own_channel) {
                hash_tags.push(channel);
            }
        }
    }

    handleMatches(common.regexes.hash, string);
    handleMatches(common.regexes.cash, string);
    handleMatches(common.regexes.user, string);

    // panels would require permission checking. postponing for now
    // handleMatches(common.regexes.panel, string);

    if (hash_tags && !common.is_private_channel(original_channel)) {
        // unique
        var seen = {};

        hash_tags = hash_tags
            .map((item) => item.replace(/[\$\# ]/g, ''))
            .filter((item) => seen.hasOwnProperty(item) ? false : (seen[item] = true))

        if (!sender_user) {
            // get the user
            let user;
            try {
                user = await db.users.get_user_by_user_id({ user_id: spiel.user_id })
            } catch (err) {
                console.error(`${new Date()} #copy_hash_spiels: error retrieving user for spiel`, spiel)

                return
            }

            // get users penalties
            const penalties = await db.moderation.get_users_penalties({ user_id: user.id })

            // add penalties to user object
            user.props = Object.assign({}, user.props, penalties)

            // send spiel to hash channels
            send_spiel_to_hash_channels({ user, spiel, hash_tags, original_channel })
        } else {
            // we already have the user, just send spiel to hash channels
            send_spiel_to_hash_channels({ user: sender_user, spiel, hash_tags, original_channel })
        }

        function send_spiel_to_hash_channels({ user, spiel, hash_tags, original_channel }) {
            hash_tags.forEach(async (hash_tag) => {
                const own_channel = hash_tag === (user.handle || user.name)
                const is_banned = await db.slave.users.banned_from_channel(user, hash_tag)

                if (is_banned && !own_channel) return
                if (unpostable(hash_tag.toLowerCase())) return

                var other_channel = hash_tag;

                if(other_channel.toLowerCase() != original_channel.toLowerCase()) {

                    if(!common.is_private_channel(other_channel)){
                        const { parent_id, spiel_id } = spiel

                        db.spiels.spiel_with_parent_exists(other_channel.toLowerCase(), parent_id, function(parent_exists) {
                            db.spiels.spiel_with_parent_exists(other_channel.toLowerCase(), spiel_id, function(spiel_exists) {
                                if(!parent_exists && !spiel_exists) {
                                    copy_spiel_to_channel(other_channel.toLowerCase(), spiel_id, user, null, original_channel)
                                }
                            });
                        });
                    }
                }
            });
        }
    }
}

// pushes spiels to 
var push_spiel = async function push_spiel({ channel, sender_user, spiel, socketId }) {
    let sender_user_id = sender_user ? sender_user.id : null;

    // push notification to mobile subscribers
    db.notifications.get_instant_push_subscribers(channel, (user_ids) => {
        redis.get_active((active_user_ids) => {
            user_ids = user_ids
                .filter((user_id) => user_id !== sender_user_id)
                .filter((user_id) => active_user_ids.indexOf(user_id) == -1)

            user_ids.forEach((user_id) => {
                db.permissions.user_is_permitted(user_id, channel, (permitted, role) => {
                    if (!permitted) return

                    const message = common.format_channel(channel)+(spiel.name ? " ["+spiel.name+"] " : " ")+spiel.spiel
                    push.sendPush({
                        user_id,
                        title: channel,
                        message,
                        link: channel+"?"+spiel.spiel_id,
                        channel
                    });
                });
            });
        });
    });

    // send the spiel over sockets
    // TODO why the io? Isn't it available globally? Is there a case where it isn't here?
    if (io) {
        var public_spiel = dto.public_spiel(spiel);

        // send to all subscribed users through sockets
        get_subscription_users(channel, async (sessions) => {
            sessions = remove_duplicate_objects(sessions, "user_id");

            sessions.forEach(async (session) => {
                // don't send to the originating user
                if (session.user_id === sender_user_id) return

                const user_should_see = await db.permissions.user_should_receive_from_user({
                    sender_user_id,
                    sender_name: spiel.name,
                    receiver_user_id: session.user_id
                });

                if (!user_should_see) return

                send_to_user(session.user_id, 'new_spiel', public_spiel);
            });
        });

        // send to all users on the given channel through sockets
        get_online(channel, async (sessions) => {
            sessions = remove_duplicate_objects(sessions, "user_id");

            sessions.forEach(async (session) => {
                const sender = session.user_id == sender_user_id;
                const user_should_see = await db.permissions.user_should_receive_from_user({
                    sender_user_id,
                    sender_name: spiel.name,
                    receiver_user_id: session.user_id
                });

                if (!user_should_see) return

                db.permissions.user_is_permitted(session.user_id, channel, (verified, role) => {
                    if (verified !== true) return

                    var spiel_copy = {}
                    for (key in public_spiel) spiel_copy[key] = public_spiel[key]

                    if (common.can_edit(channel, role) || sender) {
                        spiel_copy.editable = true;
                    } else {
                        spiel_copy.editable = false;
                    }

                    if (role) {
                        spiel_copy.role = role;
                    } else {
                        spiel_copy.role = null;
                    }

                    if (sender || session.offline) {
                        // do nothing
                    } else if(session.user_id) {
                        send_to_user(session.user_id, 'new_spiel', spiel_copy);
                    } else if(session.socket_id) {
                        io.to(session.socket_id).emit('new_spiel', spiel_copy);
                    }
                });
            });

            const online_sessions = sessions.filter((session) => !session.offline)

            for(var i=0; i<online_sessions.length; i++) {
                var session = online_sessions[i];
                db.subscriptions.update_subscription(session.user_id, channel, true, common.now(), () => {});
            }
        });

        // if it's the parent spiel, send it to #all
        if (sender_user && !sender_user.bot && !common.is_private_channel(channel) && !public_spiel.parent_id) {
            var spiel_for_all_channel = {}

            for (key in public_spiel) spiel_for_all_channel[key] = public_spiel[key];

            spiel_for_all_channel.parent_channel = spiel_for_all_channel.channel;
            spiel_for_all_channel.parent_id = spiel_for_all_channel.spiel_id;
            spiel_for_all_channel.parent_timestamp = spiel_for_all_channel.timestamp;
            spiel_for_all_channel.channel = 'all';

            io.in(format_current_channel('all')).emit('new_spiel', spiel_for_all_channel);
        }
    }
}

var ticker_data_ready_ping = function() {
    global.io.emit('ticker_data_ready');
}

var update_upload_progress = function(percent_completed, session_id) {
    var socket = get_socket_id_from_session(io, session_id)[0];
    io.to(socket).emit('upload_progress', percent_completed);
}

// Object to keep track of sessions very recent (last 10s) connection attempts
var track_sessions = {};

// Every 10 seconds check if session has tried to connect in last 10 seconds
// If not, stop tracking / delete from tracking object
setInterval(function(){
    for (session_id in track_sessions) {
        if (Date.now() - track_sessions[session_id].last_attempt > 10000) {
            delete track_sessions[session_id];
        }
    }
}, 10000);


var connect = function(io, socket, event_emitters, readers) {
    var pro_channel = null;
    var session_id;
    try {
        session_id = socket.handshake.headers.cookie.split('session=')[1].split('; ')[0];
    } catch(e) {
        session_id = null;
    }

    var user_id = null;

    var host = socket.handshake.headers['host'];
    var current_channel = socket.handshake.query.channel;

    // sets session_id for bots

    if (socket.handshake.query && socket.handshake.query.session){
        session_id = socket.handshake.query.session
    }

    db.sessions.get_or_create_session(session_id, function(session){
        session_id = session.session_id;

        // If connection is currently not being tracked, start tracking on connection

        if (!track_sessions[session_id]) track_sessions[session_id] = {
            attempts: 1,
            last_attempt: Date.now(),
            initial: true,
        }

        // If this is a second recent connection within 2 second of the last attempt
        // Increment attempts by one

        if (!track_sessions[session_id].initial) {
            if ( ( Date.now() - track_sessions[session_id].last_attempt ) < 2000 ) {
                track_sessions[session_id].attempts += 1;
            } else {
                track_sessions[session_id].attempts = 1;
            }
            track_sessions[session_id].last_attempt = Date.now();
        }

        // If five or more attempts have been made less than 2 seconds apart
        // abort connection function

        if (track_sessions[session_id].attempts >= 5) {
            return undefined;
        }

        track_sessions[session_id].initial = false;

        db.users.get_user_from_session_id(session_id, function(user){
            const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
            var username = user && user.handle ? user.handle : "";

            let user_color;
            let user_id;

            if (user){
                user_id = user.id
                user_color = user.color;
                socket.join("user:"+user_id);
            }

            // send connect event to eventorbit
            event_transport.send({
                user_id, ip, session_id,
                socket_id: socket.id,
                event_type: 'connect',
            });

            if (user_color) {
                db.sessions.set_color(session_id, user_color);
            }

            socket.session = dto.session({
                name: username,
                user_id: user ? user.id : null,
                incognito: user ? (user.prouser && user.props.incognito) : null,
                id: session_id,
                color: user_color || session.color,
                timestamp: session.timestamp,
                public_id: session.public_id,
                socket_id: socket.id,
            });

            redis.set_socket_session(socket.id, socket.session, function(){
                // WOOHOO ;)  ^_^
            });

            if (user) redis.update_active(user.id);
            socket.emit("version", { version: version });
            socket.join(format_current_channel(current_channel));

            user_join({channel: current_channel, user_id, session_id})

            broadcast_online(io, current_channel, socket.session.id ? 'force' : null);

            socket.on('join_channels', function(data){
                var channels = data.channels;
                channels.forEach(function(channel) {
                    if (current_channel != channel){
                        if(common.is_private_channel(channel)) {
                            if(user_id) {
                                db.permissions.user_is_permitted(user_id, channel, function(permitted, moderator){
                                    if (permitted) {
                                        socket.join(format_subscription_channel(channel));
                                    }
                                });
                            }
                        } else {
                            socket.join(format_subscription_channel(channel));
                        }
                    }
                });
            });

            socket.on('delete_spiel', async function(data){
                var current_session_id = socket.session.id;
                var spiel_id = data.spiel_id;

                var spiel = await db.slave.spiels.get_spiel_by_spiel_id(spiel_id);
                var channel = spiel.channel;

                db.slave.users.get_user_from_session_id(current_session_id, function(current_user){
                     db.permissions.get_user_role(current_user, channel, async function(verified, role){
                         var author_id = spiel.user_id

                         if(role == "owner" || role == "admin" || role == "site_moderator" || role == "moderator" || role == "public_moderator" || (current_user.id === author_id && spiel.timestamp > common.now() - 900000)) {
                             let source_id = (await readers.spiel_getter.basic_info_by_spiel_id({ spiel_id }))['source_id']

                             db.spiels.delete_by_spiel_id(spiel_id, channel);
                             db.spiels.delete_spiel_children(spiel_id);
                             io.emit('spiel_deleted', spiel_id);

                             // if the user responsible for the delete isn't the author
                             // but has made it through the role checks above,
                             // it's a mod deleting the spiel

                             if (author_id !== current_user.id) {
                                 const payload = {
                                     mod_id: current_user.id,
                                     user_id: author_id,
                                     spiel_id,
                                     source_id
                                 };

                                 try {
                                     await event_emitters.moderator_actions.delete_user_spiel.emit({payload});
                                 } catch (e) {
                                     console.error('Adding moderator delete spiel failed:', e);
                                 }
                             }
                         }
                         // allows user to delete messages off their profile
                         else if (current_user.handle.toLowerCase() === channel.toLowerCase() && verified) {
                            // but.. you can't delete your own spiels just because it's your channel..
                            if (current_user.id === author_id && spiel.timestamp < common.now() - 900000) {
                                return
                            }

                            db.spiels.delete_by_spiel_id(spiel_id, channel);
                            io.emit('spiel_deleted', spiel_id);
                         }
                    });
                });
            });

            socket.on('keepalive', function(data){
                var user_id = socket.session.user_id;
                redis.update_active(user_id);
                broadcast_online(io, data.channel);
            });

            socket.on('user_idle', () => {
                event_transport.send({
                    user_id, session_id, ip,
                    socket_id: socket.id,
                    event_type: 'user_idle',
                });
            })

            socket.on('user_active', () => {
                event_transport.send({
                    user_id, session_id, ip,
                    socket_id: socket.id,
                    event_type: 'user_active',
                });
            })

            socket.on('update_name', function(data){
                var name = common.clean_name(data.name);
                var channel = data.channel;
                socket.session.name = name;
                redis.set_socket_session(socket.id, socket.session, function(){
                    broadcast_online(io, channel);
                });
                if (user_id) {
                    db.users.edit_user_name(name, user.email);
                }
            });

            socket.on('subscribe', function(data){
                var channel = data.channel;
                var user_id = socket.session.user_id;
                socket.join(format_subscription_channel(channel));
                db.subscriptions.update_subscription(user_id, channel, false, Date.now(), function(){});
            });

            socket.on('remove_subscription', function(data){
                socket.leave(format_subscription_channel(data.channel));
                if(user_id) {
                    db.subscriptions.hide_subscription(user_id, data.channel);
                }
            });
            socket.on('remove_private_channel', function(data){
                socket.leave(format_subscription_channel(data.channel));
                if(user_id) {
                    db.subscriptions.delete_subscription(user_id, data.channel);
                    if(common.is_private_channel(data.channel)){
                        db.channels.delete_private_channel_subscription(user_id, data.channel);
                    }
                }
            });

            socket.on('switch_channel', function(data){
                let new_channel = data.new_channel;
                let old_channel = data.old_channel;

                // don't send an event if there was no real change
                if (old_channel !== new_channel) {
                    event_transport.send({
                        user_id, session_id, ip,
                        socket_id: socket.id,
                        event_type: 'switch',
                        data: { new_channel, old_channel }
                    });
                }

                // check if allowed
                db.permissions.user_is_permitted(user_id, new_channel, function(permitted, moderator){
                    if (permitted) {
                        current_channel = new_channel;
                        if (user_id) {
                            if(common.is_private_channel(current_channel)){
                                db.channels.private_room_is_active(user_id, current_channel, function(active){
                                    if(!active){
                                        db.channels.update_private_channel_subscription(user_id, current_channel);
                                    }
                                })
                            }
                        }

                        if (new_channel != old_channel) {
                            socket.leave(format_current_channel(old_channel));
                            socket.leave(format_subscription_channel(new_channel));
                            socket.join(format_current_channel(new_channel));
                            socket.join(format_subscription_channel(old_channel));

                            user_join({channel: new_channel, user_id, session_id});
                            user_leave({channel: old_channel, user_id, session_id});
                        }

                        if (new_channel != old_channel) {
                            broadcast_online(io, old_channel, 'force');
                            broadcast_online(io, new_channel, 'force');
                        }

                    } else {
                        socket.emit('403_error');
                    }
                });
            });

            socket.on('disconnect', function (...args){
                event_transport.send({
                    user_id, ip, session_id,
                    socket_id: socket.id,
                    event_type: 'disconnect'
                });

                user_offline({channel: current_channel, user_id, session_id});

                redis.delete_socket_session(socket.id);
                broadcast_online(io, current_channel);
            });
        });
    });
}

function init_cache() {
    if(server_id) {

        let oc_key = `server_id:${server_id}:total_online_set`;

        redis.client.del(oc_key);


        let oc_ch_query = `server_id:${server_id}:channel_online_set:*`;
        redis.client.keys(oc_ch_query, function(err, keys){
            keys.forEach((key, i) => {
                redis.client.del(key);
            });
        });

        setInterval(function() {
            redis.client.expire(oc_key, 9000);

            redis.client.keys(oc_ch_query, function(err, keys){
                if (err) {
                    return console.error('init cache err', err)
                }

                keys.forEach((key, i) => {
                    redis.client.expire(key, 9000);
                });
            });
        }, 3000);
    }
}
async function get_all_online_counts() {

    ocs_query = `server_id:*:channel_online_set:*`;
    let keys = await redis.client.keys(ocs_query);

    if(keys.length == 0) {
        return {};
    } else {
        let channelmap = {}

        let sets = keys.filter(k => {
            let channel = k.split(":")[3];
            return !common.is_private_channel(channel) && channel.length > 0
        }).map(k => {
            return ['scard', k];
        });
        let results = await redis.client.multi(sets).exec();
        results.forEach((r, i) => {

            // sets variable seems to not contain "scard" as first arg anymore after exec
            let channel = sets[i][0].split(":")[3];
            if(channelmap[channel]) {
                channelmap[channel] += parseInt(r[1]);
            } else {
                channelmap[channel] = parseInt(r[1]);
            }
        });


        return channelmap;
        //if(common.is_private_channel(channel)) {
    }
}
async function get_online_count({channel}, callback) {

    let oc_total_query;
    if(!channel || channel == '') {
        oc_total_query = `server_id:*:total_online_set`;
    } else {
        oc_total_query = `server_id:*:channel_online_set:${channel}`;
    }

    let members = 0;
    let offline_count = 0;
    if(common.is_private_channel(channel)) {
        members = (await db.users.get_private_room_users(channel)).length;
    }

    redis.client.keys(oc_total_query, function(err, keys){
        if(keys.length == 0) {
            return callback(null, {online_count: 0, offline_count: members});
        } else {
            let sets = keys.map(k => {
                return ['scard', k];
            });
            redis.client.multi(sets).exec(function(err, results){
                let total = 0
                results.forEach((r, i) => { total += r[1] });

                let offline_count = 0;
                if(common.is_private_channel(channel)) {
                    offline_count = members - total;
                }
                callback(null, {online_count: parseInt(total), offline_count});
            });
        }
    });
}

function user_join({channel, user_id, session_id}){
    let unique_id = user_id || session_id;
    redis.client.sadd(`server_id:${server_id}:channel_online_set:${channel}`, unique_id);
    redis.client.sadd(`server_id:${server_id}:total_online_set`, unique_id);
}

function user_leave({channel, user_id, session_id}){
    let unique_id = user_id || session_id;
    redis.client.srem(`server_id:${server_id}:channel_online_set:${channel}`, unique_id);
    redis.client.srem(`server_id:${server_id}:total_online_set`, unique_id);
}
function user_offline({channel, user_id, session_id}){
    user_leave({channel, user_id, session_id});

    let unique_id = user_id || session_id;
    redis.client.srem(`server_id:${server_id}:total_online_set`, unique_id);
}


module.exports = {
    connect: connect,
    send_to_invitee: send_to_invitee,
    send_to_inviter: send_to_inviter,
    invite_user: invite_user,
    copy_hash_spiels: copy_hash_spiels,
    post_spiel_to_channel: post_spiel_to_channel,
    copy_spiel_to_channel: copy_spiel_to_channel,
    send_vote_info: send_vote_info,
    update_edited_spiel: update_edited_spiel,
    ticker_data_ready_ping: ticker_data_ready_ping,
    user_verified: user_verified,
    update_upload_progress: update_upload_progress,
    system_message: system_message,
    child_system_message,
    remove_duplicate_objects: remove_duplicate_objects,
    send_ban: send_ban,
    send_unban: send_unban,
    get_online: get_online,
    get_online_count,
    get_unique_online: get_unique_online,
    get_all_online_counts,
    post_as_bot,
    notify_channel_event,
    init_cache,
}

