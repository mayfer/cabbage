

const rfr = require('rfr');

const { redis, elasticsearch } = rfr('/server/connections');
const common = rfr('/client/lib/common');



var crypto = require('crypto');

var elastic_client = elasticsearch;

var es_index = 'cabbage';

const default_results_per_page = 50;


function strip_chars (string) {
    return string.replace(/\W+/g, "");
}


function spiel_is_searchable(spiel){
    if (spiel.channel) {
        return true;
    } else {
        return false;
    }
}

var spiel_is_indexed = function(spiel, callback){
    elastic_client.exists({
        index: es_index,
        id: spiel.id
    }, function(err, exists) {
        callback(exists, spiel);
    });
};

let early_return_search_obj = {
    results: [],
    total_pages: 0,
};

async function compose_filter_query (opts) {
    let {
        since,
        until,
        filters: {
            name, terms, user_type, votes, top,
        },
        channel,
        results_per_page = default_results_per_page,
        user_id,
    } = opts;

    // filter replaced by bool.must in 5.x:
    // https://www.elastic.co/guide/en/elasticsearch/reference/5.x/query-dsl-filtered-query.html

    let q_filters = [];

    if(until) q_filters.push({"range": {"timestamp": {"lt": until}}});
    if(since) q_filters.push({"range": {"timestamp": {"gte": since}}});
    if(name) q_filters.push({"match": {"name.w_special_char": name}});
    if(user_type == 'hide_anonymous') q_filters.push({"match": {"user_anonymous": false }});
    if(user_type == 'only_trusted') q_filters.push({"range": {"user_reputation": {"gte": parseFloat(10)}}});
    if(user_type == 'only_anonymous') q_filters.push({"match": {"user_anonymous": true }});
    if(votes) q_filters.push({"range": {"votes": {"gte": parseInt(votes)}}});

    if(terms) {
        //q_filters.push({"match": {"spiel.w_special_char": terms}});
        q_filters.push(form_multi_match({ operator: 'and', query: terms, boost: 5 }));
    }

    // add channel as filter
    var special_channels = ['all', 'all-private', 'feed'];
    if (channel && special_channels.indexOf(channel.toLowerCase()) == -1) {
        q_filters.push({"terms": {"channel": [channel]}});
    }

    let is_private = false;
    if(channel.toLowerCase() == 'all-private') {
        var db = require('./db')
        is_private = true;
        let private_channels = await db.channels.get_private_channels({user_id});

        const priv_chans = private_channels.map(pc => pc.channel )

        q_filters.push({
            "terms": {
                "channel": priv_chans,
            },
        });
    } else if(channel.toLowerCase() == 'feed') {
        let feed_channels = await db.channels.get_feed_channels(user_id);
        feed_channels = feed_channels.map(function(ch) { return ch.channel });
        q_filters.push({
            "terms": {
                "channel": feed_channels,
            },
        });
    }

    let elastic_query = {
        bool: {
            filter: {bool: {must: q_filters}}
        }
    };

    // create query body
    var elastic_body = {
        from: 0,
        size: results_per_page,
        track_scores: true,
        query: elastic_query,
        sort: [ { timestamp: { order: since ? 'asc' : 'desc' } } ],
    };

    if(top) {
        elastic_body.sort = [{ score: {order: 'desc'} }];
        let now = common.now();
        let days = parseInt(top);
        let start_at = now - 1000*60*60*24 * days;
        if(until) {
            start_at = until - 1000*60*60*24 * days;
        }
        q_filters.push({"range": {"timestamp": {"gt": start_at}}});
    }

    return {
        index: es_index,
        body: elastic_body,
    };
}

function form_multi_match ({operator, query, boost}) {
    let mm_obj = {
        multi_match: {
            operator, query,
            fields: [
                "name^3",
                "name.w_special_char^3",
                "spiel^2",
                "spiel.w_special_char^2",
                "channel^3",
                "channel.w_special_char^3",
            ],
            type: "cross_fields",
        }
    };

    if (boost) mm_obj.multi_match.boost = boost;

    return mm_obj;
}

var es = {

    spiel_is_searchable,


    filter: async function (opts, cb){
        // early return if no elasticsearch client found
        if (!elastic_client){
            let err = new Error(`${new Date()} Elasticsearch client not found.`);
            console.error(err);

            return cb(err, early_return_search_obj);
        }

        var do_search = async function(opts) {
            let is_private = false;
            // create search object
            const filter_query = await compose_filter_query(opts, is_private);

            // make request
            let resp;
            resp = await elastic_client.search(filter_query);

            filter_query.body.from = filter_query.body.size;
            filter_query.body.size = 1;
            is_there_more = await elastic_client.search(filter_query);

            var total_count = resp.hits.total + is_there_more.hits.total;
            var hits = resp.hits.hits;
            var results = hits.map(hit => hit._source);

            if(opts.until) {
                results = results.reverse();
            }

            results = results.filter(function(res) {
                return res.spiel_id;
            }).map(function(result){
                if (!Array.isArray(result.channel)) {
                    return (result);
                } else {
                    result.channel = result.channel[0];
                    return (result);
                }
            });

            return {results, total_count};
        }


        let data;
        
        var center_timestamp;
        if(opts.filters && opts.filters.search_date && (!opts.since && !opts.until)) {
            // if since or until is present, it means user is scrolling, so ignore center timestamp
            center_timestamp = parseInt(opts.filters.search_date);
        }
        if(center_timestamp) {
            opts.since = undefined;
            opts.until = center_timestamp;
            let data_before = await do_search(opts);

            opts.until = undefined;
            opts.since = center_timestamp;
            let data_after = await do_search(opts);

            data = { results: data_before.results.concat(data_after.results.reverse()), total_count: data_before.total_count + data_after.total_count }
        } else {
            data = await do_search(opts);
        }
        
        if(!opts.until) {
            data.results.reverse();
        }

        return cb ? cb(null, data) : data;
    },


    update_vote_and_score: async function ({source_id, votes, score, es_index}) {
        if(!es_index) es_index = es_index;
        let result;
        try {
            result = await elastic_client.update({
                index: es_index,
                id: source_id,
                body: {
                    doc: {
                        votes: votes,
                        score: score,
                    }
                }
            });
        } catch (e) {
            console.error('es vote inc error', e);
        }

        return result;
    },


    add_spiel_to_elasticsearch: async ({spiel}) => {
        
        var hash_tags = common.get_tags(spiel.spiel, false);

        await elastic_client.create({
            index: es_index,
            id: spiel.spiel_id,
            body: spiel,
        });
    },

    create: function(db_id, body, callback, private_channel){
        var string = (body.name + " " + body.spiel);
        var hash_tags = common.get_tags(string, false);

        let search_index;
        search_index = es_index;

        body.channel = derive_channels(body.channel, hash_tags);
        body.id = db_id;

        elastic_client.create({
            index: search_index,
            id: db_id,
            body: body,
        }, function (error) {
            if(error) {
                console.error(`${new Date()} Elasticsearch connection error: `, error);
            }
            callback();
        });
    },

    destroy: function(db_id, callback){
        elastic_client.delete({
            index: es_index,
            id: db_id,
        }, function(err, response){
            if (callback) callback();
        });
    },

    edit: function(db_id, body, callback){
        es.destroy(db_id, function(){
            es.create(db_id, body, function(){});
        });
    },

    edit_spiel: async function ({ source_id, channel, spiel, name }) {
        let result;
        try {
            var string = (name + " " + spiel);
            var hash_tags = common.get_tags(string, false);
            var channels = derive_channels(channel, hash_tags);

            result = await elastic_client.update({
                index: es_index,
                id: source_id,
                body: {
                    doc: {
                        spiel: spiel,
                        channel: channels,
                        id: source_id,
                    }
                }
            });
        } catch (e) {
            console.error('es vote inc error', e);
        }

        return result;
    },

    sync_indeces: function(db_id){
        es._sync(db, db_id);
    },

    delete_absolutely_everything: function(callback){
        elastic_client.indices.delete({
            index: '_all'
        }, function(err, res) {

            if (err) {
                console.error(err.message);
            } else {
                console.log('Indexes have been deleted!');
                callback();
            }
        });
    },

    delete_disabled_users_spiels: async function delete_disabled_users_spiels({ user_handle }) {
        if (user_handle[0] !== '@') user_handle = `@${user_handle}`

        try {
            const result = await elastic_client.deleteByQuery({
                index: '_all',
                body: {
                    query: {
                        term: { name: user_handle }
                    }
                }
            });

            return { result }
        } catch (err) {
            return { err }
        }
    },

    delete_bad_stuff: function(){
        db.connect(function(db_connected){
            es.detect_improper_indeces(db_connected, 0)
        });
    },

    detect_improper_indeces: function(db_connected, db_id) {

        var state = {
            start_id: 0,
            spiels: [],
        }

        function get_messages() {
            db_connected.spiels.get_spiels_from_id(state.start_id, 1000, on_messages, true);
        }

        function on_messages(spiels) {
                if (spiels.length == 0) process.exit(0);

                state.spiels = spiels
                check_spiels();
        }

        function check_spiels() {

            var spiels_to_index = state.spiels.length;
            var spiels_checked = 0;

            for (var i = 0; i < state.spiels.length; i ++ ) {

                (function(i){
                    spiel_is_indexed(state.spiels[i], function spiel_indexer(indexed, who_cares){
                        if(!indexed){
                            spiels_checked += 1;
                            next(spiels_to_index, spiels_checked);
                        } else {
                            es.destroy(state.spiels[i].id, function(){
                                console.log('BAD INDEX --', state.spiels[i].id, ' DELETED');
                                spiels_checked += 1;
                                next(spiels_to_index, spiels_checked);
                            }, null);
                        }
                    }, false);
                })(i)

            }
        }

        function next(spiels_to_index, spiels_indexed) {

            if (spiels_to_index == spiels_indexed) {

                if (global.gc) global.gc();

                var last_spiel_id = state.spiels[state.spiels.length-1].id
                state.start_id = last_spiel_id;
                get_messages();
            }

        }

        get_messages();

    },

    _sync: function(db_connected, db_id, sync_private) {
        var state = {
            start_id: db_id || 0,
            spiels: [],
            body: [],
        }

        function get_messages() {
            db_connected.spiels.get_spiels_from_id(state.start_id, 10000, on_messages);
        }

        function on_messages(spiels) {

                if (spiels.length == 0) process.exit(0);
                state.spiels = spiels
                index_spiels();
        }

        function index_spiels() {


            var spiels_to_index = state.spiels.length;
            var spiels_indexed = 0;

            state.body = [];

            for (var i = 0; i < state.spiels.length; i ++ ) {

                (function(i){
                    if (spiel_is_searchable(state.spiels[i])) {
                        spiel_is_indexed(state.spiels[i], function spiel_indexer(indexed, who_cares){
                            if(!indexed){
                                var private_channel = state.spiels[i].channel[0] == '.' ? state.spiels[i].channel : null

                                var request_body = dto.search_result(state.spiels[i])

                                var string = (request_body.name + " " + request_body.spiel);
                                var hash_tags = common.get_tags(string, false);

                                if (private_channel !== null) {
                                    var search_index = 'private';
                                } else {
                                    var search_index = es_index;
                                }

                                request_body.channel = [request_body.channel].concat(hash_tags);

                                state.body.push( { index: { _index: search_index, _id: state.spiels[i].id }} )
                                state.body.push(request_body);

                                spiels_indexed += 1;
                                next(spiels_to_index, spiels_indexed);
                            } else {
                                spiels_indexed += 1;
                                next(spiels_to_index, spiels_indexed);
                            }
                        }, state.spiels[i].channel[0] == '.')
                    } else {
                        spiels_indexed +=1;
                        next(spiels_to_index, spiels_indexed);
                    }
                })(i)

            }
        }

        function next(spiels_to_index, spiels_indexed) {

            if (spiels_to_index == spiels_indexed) {

                elastic_client.bulk({
                  body: state.body
                }, function (err, resp) {
                    if (global.gc) global.gc();

                    var last_spiel_id = state.spiels[state.spiels.length-1].id
                    console.log("L",last_spiel_id);
                    state.start_id = last_spiel_id;
                    get_messages();
                });

            }

        }

        get_messages();

    }
}

function derive_channels (channel_str, hash_tags) {
    let channels = new Set();
    if (channel_str) channels.add(channel_str.toLowerCase());

    for (let tag of hash_tags) {
        channels.add(tag.toLowerCase());
    }

    return Array.from(channels);
}

module.exports = es
module.exports.es_index = es_index;
