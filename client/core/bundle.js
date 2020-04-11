
define(function(require, exports) {
    const Preact = require("core/preact-umd");
    const htm = require("core/htm-umd");

    Preact.html = htm.bind(Preact.h);

    return Preact
});
