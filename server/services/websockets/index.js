var format_relevant_channel = function(channel){
    return "channel:relevant:"+channel.toLowerCase();
};

var format_current_channel = function(channel){
    return "channel:current:"+channel
};

function debug(...args) {
    // console.log(...args);
}


const rfr = require('rfr');
const redis_client = rfr('/server/connections').redis;

module.exports = async function({io}) {

    io.on('connection', async function(socket) {
        const TTL = 60*60*24;

        let user = socket.client.request.session.passport ? socket.client.request.session.passport.user : undefined;
        let socket_id = socket.id;
        let session_id = socket.client.request.sessionID;
        let user_id;

        let current_channel;

        if(user) user_id = user.user_id;


        socket.on('disconnect', async (...args) => {
            let channel = current_channel;
            debug("Disconnect", {user_id, socket_id, args});
            await redis_client.del("channel:"+channel+":"+session_id);

            notify_online_count({channel});
        });

        socket.on('leave_channel', async ({old_channel}) => {
            debug("Leave", old_channel, {user_id, socket_id});
            let channel = old_channel;

            socket.leave(format_current_channel(channel));
            await redis_client.del("channel:"+channel+":"+session_id);
            current_channel = null;

            notify_online_count({channel});

        });
        socket.on('join_channel', async ({new_channel}) => {
            debug("Join", new_channel, {user_id, socket_id, new_channel});
            let channel = new_channel;
            socket.join(format_current_channel(channel));

            current_channel = channel;

            let session = socket.client.request.session;
            let session_json = JSON.stringify(session);
            await redis_client.setex("channel:"+channel+":"+session_id, TTL, session_json);

            notify_online_count({channel});
        });

        debug("connected", {user, socket_id})

        if(user) {

            await redis_client.set(["user_sockets:"+user_id+":"+socket_id, socket_id]);
            await redis_client.expire("user_sockets:"+user_id+":"+socket_id, TTL);

            await redis_client.set("active:"+user_id, 1);
            await redis_client.expire("active:"+user_id, 5);
        }
    });

    async function send_to_channel({channel, type, message}) {
        io.to(format_current_channel(channel)).emit(type, message);
        debug("sent", {channel, type, message})
    }

    async function get_users_in_channel({channel}) {
        let keys = await redis_client.keys("channel:"+channel+":*");
        // more stuff
        return keys;
    }

    async function get_num_users_in_channel({channel}) {
        let keys = await redis_client.keys("channel:"+channel+":*");
        return keys.length;
    }

    async function notify_online_count({channel}){
        let count = await get_num_users_in_channel({channel});
        debug("online count", {channel, count})
        send_to_channel({channel, type: "online_count", message: {channel, count}});
    }

    async function send_to_user({user_id, type, message}) {
        // send to all online sessions of this user
        io.to(format_current_channel(channel)).emit(type, message);
    }

    async function send_to_session({}) {

    }

    async function send_to_socket({}) {

    }

    return {
        send_to_channel,
        get_users_in_channel,
        get_num_users_in_channel,
        notify_online_count,
        send_to_user,
        send_to_session,
        send_to_socket,
    };

    /*
    io.on('connection', function(socket) {
        socket.request

        var host = socket.handshake.headers['host'];
        var current_channel = socket.handshake.query.channel;

        if (socket.handshake.query && socket.handshake.query.session){
            session_id = socket.handshake.query.session
        }

        ...db.sessions.get_or_create_session(session_id);

        session_id = session.session_id;

        let user = ...db.users.get_user_from_session_id(session_id, function(user){
        const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
        var username = user && user.handle ? user.handle : "";

        let user_color;
        let user_id;

        if (user){
            user_id = user.id
            user_color = user.color;
            socket.join("user:"+user_id);
        }


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
                    let permitted = await db.permissions.user_is_permitted(user_id, channel);
                    if (permitted) {
                        socket.join(format_subscription_channel(channel));
                    }
                }
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

    */

}
