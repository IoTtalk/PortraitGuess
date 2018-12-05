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
    var d = Date.now();

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
    for(var i = 0; i < list.length; i++){
        if(list[i].order == order){
            return list[i].id;
        }
    }
    return "none";
}

var checkCategoryused = function(used_list, categoryId){
    for(var i = 0; i < used_list.length; i++){
        // console.log(used_list[i].category_id.toString(), categoryId);
        if(used_list[i].category_id.toString() == categoryId){
            return 1;
        }
    }
    return 0;
}

var auth = function(req, res, next){
    var user = basicAuth(req);
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

var generateGame = function(nameList){
    var option_info_list = [],
        option_info, duplicate_flag;

    if(nameList.length <= 5){
        return [nameList, ""];
    }

    do{
        //get randon nameList info
        option_info = nameList[Math.floor(Math.random() * nameList.length)].info;
        
        //check if duplicate info
        duplicate_flag = false;
        for(var i = 0; i < option_info_list.length; i++){
            if(option_info_list[i] == option_info){
                duplicate_flag = true;
                break;
            }
        }

        //put randon nameList info into list
        if(!duplicate_flag){
            option_info_list.push(option_info);
        }
    }while(option_info_list.length <= 5);
    
    //find answer picture path
    var gameAnswerPicPathList = [];
    for(var i = 0; i < nameList.length; i++){
        if(nameList[i].info == option_info_list[0]){
            var total_pic = Object.keys(nameList[i].path).length;
            for(var j = 1; j <= total_pic; j++){
                gameAnswerPicPathList.push(nameList[i].path[j]);
            }
            break;
        }
    }

    console.log("---game options---\n", option_info_list);
    console.log("---game answer---\n", option_info_list[0]);
    console.log("---game answer picture path---\n",gameAnswerPicPathList);

    return [option_info_list, gameAnswerPicPathList];
}

module.exports = {
    createFolder: createFolder,
    sendResponse: sendResponse,
    sendEjsRenderResponse: sendEjsRenderResponse,
    uuid: uuid,
    getPicIdbyOrder: getPicIdbyOrder,
    checkCategoryused: checkCategoryused,
    auth: auth,
    generateGame: generateGame
};
