
define(function(require, exports) {
    
    let common = {
        script_safe_json: function(obj) {
            return JSON.stringify(obj).replace(/<\/script/gi, '< /script');
        },

        uuid: function(length){
            var d = this.now();
            var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.slice(0,length).replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
            });
            return uuid;
        },

        now: function(){
            return Date.now();
        },

        script_safe_json: function(obj) {
            return JSON.stringify(obj).replace(/<\/script/gi, '< /script');
        },


        auto_format_price: function(price) {
            if(!price) return '';
            var raw_string = parseFloat(price).toFixed(4);
            var decimals = raw_string.split('.')[1];
            if(decimals && decimals[3] != '0' && parseFloat(price) <= 0.50) {
                return common.format_price(price, 4);
            } else if(decimals && decimals[3] == '0' && decimals[2] != '0' && parseFloat(price) <= 0.50) {
                return common.format_price(price, 3);
            } else if(decimals && decimals[0] == '0' && decimals[1] == '0' && Math.abs(parseFloat(price)) >= 1000) {
                return common.format_price(price, 0);
            } else {
                return common.format_price(price, 2);
            }

        },
        format_price: function(price, decimals) {
            if(decimals === undefined) decimals = 3;
            if(decimals == 0) {
                return parseFloat(price).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').split('.')[0];
            }
            return parseFloat(price).toFixed(decimals).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        },

        get_channel_formatting: function(item) {
            
            var label='', classes='', icon=item.icon || '';
            var icons = {
                "feed": '<span class="icon icon-notifications"></span>',
                "": '<span class="icon icon-home"></span>',
                "index": '<span class="icon icon-sphere"></span>',
                "featured": '<span class="icon icon-star-full"></span>',
                "rss_stream": '<span class="icon icon-star-full"></span>',
                "popular": '<span class="icon icon-thumbsup"></span>',
                "newsroom": '<span class="icon icon-newspaper-o"></span>',
                "articles": '<span class="icon icon-pencil"></span>',
                "insiders": '<span class="icon icon-file-text"></span>',
                "feedback": '<span class="icon icon-bubble"></span>',
                ".pros": '<span class="icon icon-bolt"></span>',
                "all": '<span class="icon icon-eye"></span>',
                "bookmarks": '<span class="icon icon-bookmarks"></span>',
            }

            if(item.label) {
                label = item.label;
            } else if(icons[item.channel]) {
                label = item.channel;
                icon = icons[item.channel];
                if(item.channel == "") {
                    label = "home";
                }
                if(item.channel == "featured") {
                    label = "editors";
                }
                if(item.channel == ".pros") {
                    label = "pros";
                }
                if(item.channel == "rss_stream") {
                    label = "rss";
                }
            } else if(common.is_public_channel(item.channel)) {
                if(item.channel[0] == "@") {
                    label = item.channel;
                } else if(item.type && item.type == "commodity" || (item.type == "cash" && item.category == "commodities")) {
                    label = item.channel[0].toUpperCase() + item.channel.slice(1);
                } else if(item.direction || (item.type && item.type == "company") || (item.type && item.type == "cash")) {
                    label = "$" + item.channel.toUpperCase();
                } else {
                    label = "#" + item.channel;
                }
                if(item.type == "you") {
                    icon = "<span class='icon icon-users'></span>";
                }
            } else if(common.is_direct_message_channel(item.channel)) {
                 icon = '<span class="icon-users"></span>';
                 label = item.channel;
            } else if(common.is_private_channel(item.channel)) {
                icon = '<span class="icon-lock"></span>';
                label = item.channel;
            } else if(common.is_panel(item.channel)) {
                icon = '<span class="icon-mic"></span>';
                label = item.channel;
            }

            var format = {
                label: label,
                icon: icon,
                classes: classes,
            }

            return format;
        },

        format_date: function(raw_date, opts) {

            opts = {
                day_only: opts && opts.day_only || false,
                month_only: opts && opts.month_only || false,
                abbreviate: opts && opts.abbreviate || false,
                no_year: opts && opts.abbreviate || false,
            }

            function getOrdinal(n) {
                var s=["th","st","nd","rd"],
                v=n%100;
                return (s[(v-20)%10]||s[v]||s[0]);
            }
            var monthNames

            if (opts.abbreviate) {
                monthNames = [
                  "Jan", "Feb", "Mar",
                  "Apr", "May", "Jun", "Jul",
                  "Aug", "Sep", "Oct",
                  "Nov", "Dec"
                ];
                dayNames = [
                  "Sun", "Mon", "Tue", "Wed",
                  "Thu", "Fri", "Sat",
                ]
            } else {
                monthNames = [
                  "January", "February", "March",
                  "April", "May", "June", "July",
                  "August", "September", "October",
                  "November", "December"
                ];
                dayNames = [
                  "Sunday", "Monday", "Tuesday", "Wednesday",
                  "Thursday", "Friday", "Saturday",
                ]
            }

            var date = new Date(parseInt(raw_date));
            var day = date.getDate();
            var dayIndex = date.getDay();
            var monthIndex = date.getMonth();
            var year = date.getFullYear();
            var dayName = dayNames[dayIndex];
            var monthName = monthNames[monthIndex];

            if (opts.day_only) {
                var date = dayName + ' ' + day
            } else if(opts.no_year) {
                var date = (monthName + (opts.month_only ? '' :(' ' + day)));
            } else {
                var date = (monthName + (opts.month_only ? '' :(' ' + day + ', ' + year)));
            }

            return date;
        },

        format_time: function(unix_timestamp, am_pm) {
            var time;
            if(am_pm) {
                var date = new Date(unix_timestamp);
                var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
                var am_pm = date.getHours() >= 12 ? "PM" : "AM";
                var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
                time = hours + ":" + minutes + " " + am_pm;
            } else {
                var a = new Date(unix_timestamp);
                var hour = a.getHours();
                var min = a.getMinutes();
                var sec = a.getSeconds();

                min = min < 10 ? '0' + min : min;
                hour = hour < 10 ? '0' + hour : hour;

                time = hour + ':' + min;
            }
            return time;
        },

        format_datetime: function(unix_timestamp){
            var a = new Date(unix_timestamp);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes();
            var sec = a.getSeconds();

            min = min < 10 ? '0' + min : min;
            hour = hour < 10 ? '0' + hour : hour;

            var time = date + ' ' + month + ' ' + year + ', ' + hour + ':' + min;
            return time;
        },

        format_channel: function(channel) {
            return (channel[0] == "@") ? channel : (common.is_panel(channel) ? channel : "#"+channel);
        },

        number_formatter: function(num, digits, abbreviate_thousands) {
            var si = [
                { value: 1E18, symbol: " E" },
                { value: 1E15, symbol: " P" },
                { value: 1E12, symbol: " T" },
                { value: 1E9,  symbol: " B" },
                { value: 1E6,  symbol: " M" },
                { value: 1E3,  symbol: "k" }
            ], rx = /\.0+$|(\.[0-9]*[1-9])0+$/, i;
            for (i = 0; i < si.length; i++) {
                if (num >= si[i].value) {
                    if (si[i].value == 1E3 && !abbreviate_thousands) {
                        var nstring = ''+num;
                        var len = nstring.length;
                        var back = nstring.slice(len-3,len);
                        var front = nstring.slice(0,len-3);
                        return front+','+back;
                    } else {
                        return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
                    }
                }
            }
            return num.toFixed(digits).replace(rx, "$1");
        },

        get_tags: function(string, is_article) {

            var regex_hash = /(^|\s|>)([#\$])([a-zA-Z][\w\-\_\/\.]*)\b/g;
            var regex_at = /(^|\s|>)(@)([\w\-\_\/\.]*)\b/g;
            return common.handleMatches(regex_hash, string, is_article).concat(common.handleMatches(regex_at, string, is_article))
        },

        handleMatches: function(regex, string, is_article){
            var hash_tags = [];
            var match;
            if (is_article) {
                match = regex.exec(string);
                var handle = match[2] + match[3];
                hash_tags.push(handle);
            } else {
                while(match = regex.exec(string)) {
                    var type = match[2];
                    var channel = match[3];
                    if(type == "@") {
                        channel = type + channel;
                    }

                    hash_tags.push(channel);
                }
            }
            return hash_tags
        },

        pretty_date: function(UNIX_timestamp){
            if (UNIX_timestamp){
                var a = new Date(UNIX_timestamp);
                var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                var year = a.getFullYear();
                var month = months[a.getMonth()];
                var date = a.getDate();
                var time = month + " " + date + " " + year;
                return time;
            }
        },

        regexes: {
            panel: /(^|\s|>|,)(#~|~)([a-zA-Z][\w\-\_\/]*\.?[\w\-\_\/]*)\b/g,
            // hash: /(^|\s|>|,)(#)([a-zA-Z][\w\-\_\/]*\.?[\w\-\_\/]*)\b/g,   -- new regex below has deeplink support
            hash: /(^|\s|>|,)(#)([a-zA-Z][\w\-\_\/]*\.?[\w\-\_\/]*)(\[([a-zA-Z0-9]+)\]|\b)/g,
            cash: /(^|\s|>|,)(\$)([a-zA-Z][\w\-\_\/]*\.?[\w\-\_\/]*)\b/g,
            user: /(^|\s|>|,)(@)(([\w\-\_\/:]\.?)*[\w\-\_\/]+)\b/g,
        },

        format_slug: function(text, keep_trailing_space) {
            var slug = text.trim().toLowerCase().split(' ').join('-');
            slug = slug.replace(/[^A-Za-z0-9-]/g,'').replace(/\s/g,'').replace(/\-{2,}/g,'-');
            if(!keep_trailing_space) {
                slug = slug.replace(/-$/,'');
            }
            return slug;
        },

        linkify: function (base_url, string, target) {

            if (!string) return string;

            string = string.replace(/(\b(((https?|ftp|file):\/\/)|(www\.))[-A-Z0-9+&@#\/%?=~_|!:,.;\[\]]*[-A-Z0-9+&@#\/%=~_|])/ig, function (captured) {
                var uri;

                if (captured.toLowerCase().indexOf("www.") == 0) {
                    uri = "http://" + captured
                } else {
                    uri = captured
                }
                if(target === undefined) {
                    target = "_blank";
                }
                return '<a href="' + uri + '" class="linkified" target="' + target + '">' + captured + "</a>"
            });
            string = string.replace(common.regexes.panel, "$1<a class='hash panel' data-channel='~$3' href='"+base_url+"/~$3'>$2$3</a>");
            string = string.replace(common.regexes.hash, "$1<a class='hash' data-channel='$3' data-spiel_id='$5' href='"+base_url+"/$3?$5'>$2$3$4</a>");
            string = string.replace(common.regexes.cash, "$1<a class='hash cash' data-channel='$3' href='"+base_url+"/$3'>$2$3</a>");
            string = string.replace(common.regexes.user, function(string, html, at_sign, name) {
                var handle = at_sign+name;
                var css_classes;
                if (string.indexOf('/') != -1) {
                    css_classes = 'hash article'
                } else if (string.indexOf(':') != -1) {
                    css_classes = 'hash shared'
                } else {
                    css_classes = 'hash at'
                }
                return html+"<a class='"+css_classes+"' data-channel='"+handle+"' href='"+base_url+"/"+handle+"'>"+handle+"</a>";
            });
            return string
        },

        market_tag_buttons: function(string) {
            string = string.replace(/SEDI:(\w+)/gi, function(string, channel){
                return "<a class='hash sedi' data-channel='"+channel+"'><span class='icon sedi icon-file-text'></span>SEDI:"+channel+"</a>";
            });

            string = string.replace(/WIKI:(\w+)/gi, function(string, channel){
                return "<a class='hash wiki' data-channel='"+channel+"'><span class='icon sedi icon-file-text'></span>WIKI:"+channel+"</a>";
            });

            string = string.replace(/BUY:([a-zA-Z.-]+)/gi, function(string, channel){
                return "<a class='hash buy papertrade' data-channel='"+channel+"'><span class='icon buy icon-volume-medium'></span>BUY:"+channel+"</a>";
            });
            string = string.replace(/SELL:([a-zA-Z.-]+)/gi, function(string, channel){
                return "<a class='hash sell papertrade' data-channel='"+channel+"'><span class='icon buy icon-volume-medium'></span>SELL:"+channel+"</a>";
            });
            return string;
        },

        htmlentities: function(str) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        },


        encode_querystring: function(params, prefix) {
            var items = [];
            for(var field in params) {
                var key  = prefix ? prefix + "[" + field + "]" : field;
                var type = typeof params[field];
                switch(type) {
                    case "object":
                        
                        //handle arrays appropriately x[]=1&x[]=3
                        if(params[field].constructor == Array) {
                            params[field].each(function(val) {
                                items.push(key + "[]=" + val);
                            }, this);
                        } else {
                            //recusrively construct the sub-object
                            items = items.concat(this.encode_querystring(params[field], key));
                        }
                        break;
                    case "function":
                        break;
                    default:
                        items.push(key + "=" + escape(params[field]));
                        break;
                }
            }

            return items.join("&");
        },
        
        /**
        * Decode a deeply nested Url
        */
        decode_querystring: function(params) {
            var obj   = {};
            var parts = params.indexOf("&") == -1 ? [params] : params.split("&");
            
            parts.forEach(function(kvs) {
                var kvp = kvs.split("=");
                var key = kvp[0];
                var val = unescape(kvp[1]);
                
                if(/\[\w+\]/.test(key)) {
                    var rgx = /\[(\w+)\]/g;
                    var top = /^([^\[]+)/.exec(key)[0];
                    var sub = rgx.exec(key);
                    
                    if(!obj[top]) {
                        obj[top] = {};
                    }
                    
                    var unroot = function(o) {
                        if(sub == null) {
                            return;
                        }
                        
                        var sub_key = sub[1];
                        sub = rgx.exec(key);
                        
                        if(!o[sub_key]) {
                            o[sub_key] = sub ? {} : val;
                        }
                        
                        unroot(o[sub_key]);
                    };
                    unroot(obj[top]);
                } else if(/\[\]$/.test(key)) {
                    key = /(^\w+)/.exec(key)[0];
                    if(!obj[key]) {
                        obj[key] = [];
                    }
                    obj[key].push(val);
                } else {
                    obj[key] = val;
                }
            });
            
            return obj;
        },

        copy_link: function(e) {
            e.preventDefault()
            var dummy = document.createElement("textarea");
            document.body.appendChild(dummy);
            dummy.value = window.location.href;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
            return window.location.href;
        },
        
        timeSince(date) {
            var seconds = Math.floor((new Date() - date) / 1000);
            var interval = Math.floor(seconds / 31536000);

            if (interval > 1) {
                return interval + " years";
            }
            interval = Math.floor(seconds / 2592000);
            if (interval > 1) {
                return interval + " months";
            }
            interval = Math.floor(seconds / 86400);
            if (interval > 1) {
                return interval + " days";
            }
            interval = Math.floor(seconds / 3600);
            if (interval > 1) {
                return interval + " hours";
            }
            interval = Math.floor(seconds / 60);
            if (interval > 1) {
                return interval + " minutes";
            }
            return Math.floor(seconds) + " seconds";
        }

    }
    return common;
});

