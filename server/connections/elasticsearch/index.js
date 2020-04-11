//var db = require('./db');
var elasticsearch = require('elasticsearch');

const rfr = require('rfr');
const credentials = rfr('credentials.json');

var elastic_client = new elasticsearch.Client({
    requestTimeout: 2000,
    suggestCompression: true,
    host: credentials.elasticsearch.host+":"+credentials.elasticsearch.port || 'localhost:9200',
    keepAlive: true,
    maxRetries: 5,
    apiVersion: '7.3',
});

const es_settings = {
    "number_of_shards": 5,
    "number_of_replicas": 0,
};


var es_index = 'teaorbit';
var es_table = 'spiels';


const type = 'spiel';


const mapping = {
    properties: {
        id: {
            type: "long"
        },
        /*
        channel_id: {
            type: "integer",
        },
        channel_type: {
            type: "integer",
        },
        */
        channel: {
            type: "text",
            analyzer: "keyword",
            fields: {
                w_special_char: {
                    type: "text",
                    analyzer: "standard"
                }
            }
        },        
        color: {
            type: "keyword"
        },
        name: {
            type: "text",
            analyzer: "whitespace",
            fields: {
                w_special_char: {
                    type: "text",
                    analyzer: "standard"
                }
            }
        },
        spiel: {
            type: "text",
            analyzer: "whitespace",
            fields: {
                w_special_char: {
                    type: "text",
                    analyzer: "standard"
                }
            }
        },
        user_public_id: {
            type: "keyword"
        },
        spiel_id: {
            type: "keyword"
        },
        timestamp: {
            type: "long"
        },
        votes: {
            type: "integer"
        },
        score: {
            type: "integer"
        },
        user_reputation: {
            type: "double"
        },
        user_anonymous: {
            type: "boolean"
        },
    },
};



function checkIndices({force_delete}) {
    elastic_client.indices.exists({index: es_index}, (err, res, status) => {
        if (res) {
            // index exists
            if(force_delete) {
                elastic_client.indices.delete({
                    index: es_index
                }, function(err, res) {

                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log('** Index '+es_index+' has been deleted!');
                    }
                });
            }
        } else {
            console.log(`** Missing Elasticsearch index "${es_index}", creating...`);
            const body = {
                settings: es_settings,
                mappings: mapping,
            };

            elastic_client.indices.create( {index: es_index, body}, (err, res, status) => {
            if(err) console.log("Error creating index", err);
            else console.log("** Created index");
        })
      }
    })
}
checkIndices({force_delete: false, elastic_client})




module.exports = elastic_client

