var fs = require('fs'),
    ejs = require('ejs'),
    basicAuth = require('basic-auth'),
    config = require('./config');

var createFolder = function(folder){
    try{
        fs.accessSync(folder); 
        return false; // exist
    }catch(e){
        fs.mkdirSync(folder);
        return true; // does not exist 
    }
}

var sendResponse = function(res, statusCode, contents){
    res.writeHead(statusCode, {"Content-Type": "text/html"});
    res.end(contents);
}

var sendEjsRenderResponse = function(res, statusCode, contents, JSONdata){
    res.writeHead(statusCode, {"Content-Type": "text/html"});
    res.end(ejs.render(contents, JSONdata));
}

var uuid =  function(){
    let d = Date.now();

    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

var getPicIdbyOrder = function(list, order){
    for(let i = 0; i < list.length; i++){
        if(list[i].order == order){
            return list[i].id;
        }
    }
    return "none";
}

var auth = function(req, res, next){
    let user = basicAuth(req);
    if(!user || !user.name || !user.pass){
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(401);
        return;
    }
    if(user.name === 'admin' && user.pass === '0000'){
        next();
    } 
    else{
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(401);
        return;
    }
}

var getFilesizeInBytes = function(filename) {
    try {
        let stats = fs.statSync(filename);
        let fileSizeInBytes = stats["size"];
        return fileSizeInBytes;
    }
    catch(err) {
        console.log(filename, ' does not exist');
        return null;
    }
}

module.exports = {
    createFolder: createFolder,
    sendResponse: sendResponse,
    sendEjsRenderResponse: sendEjsRenderResponse,
    uuid: uuid,
    getPicIdbyOrder: getPicIdbyOrder,
    auth: auth,
    getFilesizeInBytes: getFilesizeInBytes
};
