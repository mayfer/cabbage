
// dependencies
const Bluebird = require('bluebird');
const utils = require('./utils');
const path = require('path');

// export db wrapper class
module.exports = class DB_Wrapper {
    constructor (conn, opts = {}) {
        if (!conn) throw new Error('DB_Wrapper requires wrapped connection');

        this.conn = conn;
        this.is_slave = opts.slave;

    }

    async execute (query, inserts) {
        // if read-only cashorbit instance, check if query mutates
        if (this.is_slave && !is_readonly_query(query)) {
            return this.throw_readonly_error(query, inserts);
        }

        // console.log("SQL", query, inserts);

        // compose query
        var q = this.format_query(query, inserts);

        // make query
        let client = await this.conn.connect();
        let result;
        // make request
        result = await client.query({text: q.query, values: q.params});

	client.release();


        // return
        return result;
    }

    async return_one(query, inserts) {
        let {rows} = await this.execute(query, inserts);
        return rows[0];
    }

    async transaction (queries, inserts_array, callback) {
        let promises = [];
        let client = await this.conn.connect();

        try {
            await client.query('BEGIN');
            try {
                for(var i=0; i<queries.length; i++) {
                    var query = queries[i];
                    var inserts = inserts_array[i];
                    var q = this.format_query(query, inserts);

                    promises.push(client.query(q.query, q.params));
                }

                await Bluebird.all(promises);
                await client.query('COMMIT');
            } catch (err) {
              await client.query('ROLLBACK');
              console.error('transaction error', err);

              if (callback) callback(err);
            }
        } finally {
            client.release();
            if(callback) callback();
        }
    }

    /**
     * Utils
     */
    // TODO remove the need
    connect (callback) {
        if(callback) callback(this);

        return this;
    }

    format_query (query, inserts) {
        const params = [];
        if(inserts) {
            if(Object.keys(inserts).length > 0) {
                let index = 1;

                query = query.replace(/\{(.+?)\}/g, function (txt, key) {
                    params.push(inserts[key]);
                    return "$" + index++;
                });
            }
        }

        return { query, params };
    }
    
    throw_readonly_error (query, inserts, callback) {
        let error_str ='[DB WRAPPER] INSERT/UPDATE/DELETE detected against slave';
        let err = new Error(error_str, query);

        log_sql_error(query, inserts, err);

        if (callback) return callback(err);
        else throw err;
    }

    /**
     * Analysis
     */
};

function is_readonly_query (query) {
    const scan_query = query
        .toUpperCase()
        .replace(/\n/g, ' ')
        .trim();

    return (
        scan_query.indexOf('SELECT ') === 0 && 
        scan_query.indexOf('INSERT ') == -1 && 
        scan_query.indexOf('UPDATE ') == -1 && 
        scan_query.indexOf('DELETE ') == -1
    );
}

function log_sql_error (command, inserts, content) {
    console.error(`${new Date()} SQL Error`);
    console.error("Query:", command);
    console.error("Inserts:", inserts);
    console.error("Error:", content);
}
