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

var generateGame = function(preAnswerID, answerIDList, nameIDList, nameList){
    var option_info_list = [],
        option_info, duplicate_flag, index, answerID;

    if(nameList.length <= 5){
        console.log("nameList less then 5");
        return [nameList, "", ""];
    }

    
    //generate answerID
    do{
        answerID = answerIDList[Math.floor(Math.random() * answerIDList.length)];
    } while(answerID == preAnswerID);

    //check answer in the nameList
    index = nameIDList.indexOf(answerID);
    if(index > -1){ //exist
        //get answer info
        var answer_info = nameList[index].info;

        //get answer path
        var gameAnswerPicPathList = [];
        var total_pic = Object.keys(nameList[index].path).length;
        for(var j = 1; j <= total_pic; j++){
            gameAnswerPicPathList.push(nameList[index].path[j]);
        }

        do{
            //get randon nameList info
            option_info = nameList[Math.floor(Math.random() * nameList.length)].info;
            if(option_info == answer_info){
                continue;
            }
            
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
        } while(option_info_list.length <= 4);

        //append the answer info in option_info_list[0]
        option_info_list.unshift(answer_info);

        console.log("---game options---\n", option_info_list);
        console.log("---game answer---\n", option_info_list[0]);
        console.log("---game answer picture path---\n",gameAnswerPicPathList);

        return [option_info_list, gameAnswerPicPathList, answerID];

    }
    else{
        console.log("answerID is not in the nameList");
        return [[], "", ""];
    }
}

var getHumanInfoStr = function(chi_name, eng_name, birth_year, death_year){
    var info = "";

    if(chi_name != ""){
        info = info + chi_name + " , "
    }

    if(eng_name != ""){
        info = info + eng_name + " , "
    }

    info = info + birth_year + " - " + death_year;

    return info
}

module.exports = {
    createFolder: createFolder,
    sendResponse: sendResponse,
    sendEjsRenderResponse: sendEjsRenderResponse,
    uuid: uuid,
    getPicIdbyOrder: getPicIdbyOrder,
    checkCategoryused: checkCategoryused,
    auth: auth,
    generateGame: generateGame,
    getHumanInfoStr: getHumanInfoStr
};
