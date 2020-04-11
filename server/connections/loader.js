
module.exports =  new Promise((resolve, reject) => {
    require('./')
        .on('ready', resolve)
        .init()
});
