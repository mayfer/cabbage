define([], function() {
    function add_parents(parentSelector, css) {
        const reg = /^([ ]*)([a-zA-Z0-9,.:>_ -]+?)\s?\{/gm;
        return css.replace(reg, "$1" + parentSelector + " $2 {");
    }

    function load(id, css) {
        if(typeof document !== "undefined") {
            var head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            style.type = 'text/css';
            style.id = "css-"+id;
            if (style.styleSheet){
              // This is required for IE8 and below.
              style.styleSheet.cssText = css;
            } else {
              style.appendChild(document.createTextNode(css));
            }

            if(!document.getElementById(style.id)) {
                head.appendChild(style);
            }
        }
    }

    function load_remote(path) {
        if(typeof document !== "undefined") {
            let id = path.replace(/[^a-zA-Z0-9_-]+/g, '_');
            if(!document.querySelector('link#'+id)) {
                let head = document.head;
                let link = document.createElement("link");

                link.type = "text/css";
                link.rel = "stylesheet";
                link.href = path;
                link.id = id;

                head.appendChild(link);
            }
        }
    }



    return {
        load,
        add_parents,
        load_remote,
    }
});
