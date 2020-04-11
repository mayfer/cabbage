
// dependencies
const { join } = require('path');
const {
    lstatSync,
    readdirSync
} = require('fs');

/**
 * Exports
 */
module.exports = {
    is_directory,
    get_directories,
};

// is_directory
function is_directory (source) {
    return lstatSync(source).isDirectory();
}

// get_directories
function get_directories (source) {
    return readdirSync(source)
        .map((name) => join(source, name))
        .filter(is_directory);
}
