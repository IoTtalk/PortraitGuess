/**
 * Created by kuan on 2017/5/21.
 */
var express = require("express"),
    app = express(),
    http = require("http").createServer(app),
    io = require('socket.io')(http),
    fs = require('fs'),
    ejs = require('ejs'),
    shortid = require('shortid'),
    bodyParser = require('body-parser'),
    path = require('path'),
    formidable = require('formidable'),
    readChunk = require('read-chunk'),
    fileType = require('file-type'),
    dai = require("./dai").dai,
    config = require('./config'),
    websocketclient = require("./websocketclient").WebSocketClient,
    utils = require("./utils"),
    db = require('./db').db;

/*** upload ***/
var uploadFolder = './upload_cache/';
utils.createFolder(uploadFolder);
/******/

/*** register to IoTtalk ***/
// dai.register();

/*** connect websocket to paintingDA ***/
var connectedCount;
var isGamePlaying;

var ws2Painting = new websocketclient();
ws2Painting.open('ws://' + config.paintingIP + ':' + config.webSocketPort);
ws2Painting.onerror= function(err){
    console.log('FrameDA is not running!');
};
ws2Painting.onopen = function(){
    /*** socket.io ***/
    connectedCount = 0;
    isGamePlaying = false;
    var playID = undefined;
    io.on('connection', function(socket){
        connectedCount++; 
        console.log("connected count: " + connectedCount);
        socket.on("disconnect", function(){
            connectedCount--;
            console.log("connected count: " + connectedCount);
            if((isGamePlaying && playID == socket.id) || connectedCount == 0){
                //ws2Painting.send("leaveGame");
                ws2Painting.send(JSON.stringify({
                    "Command": "leaveGame"
                }));
                console.log("leaveGame");
                isGamePlaying = false;
                playID = undefined;
            }
        });
        socket.emit("checkUrl", "");
        socket.on("checkUrl", function(msg){
            console.log(msg);
            if(msg != url){
                socket.emit("checkUrlACK", {"urlCorrect": false});
            }
            else{
                //ws2Painting.send("enterGame");
                ws2Painting.send(JSON.stringify({
                    "Command": "enterGame"
                }));
                console.log("enterGame");
                socket.emit("checkUrlACK", {"urlCorrect": true});
            }
        });
        socket.on("playACK", function(msg){
            console.log("request to start the game");
            if(playID != socket.id){
                socket.emit("isGamePlaying", {"isGamePlaying": isGamePlaying});
                if(isGamePlaying == false){
                    isGamePlaying = true;
                    playID = socket.id;
                    socket.broadcast.emit('isGamePlaying', {"isGamePlaying": isGamePlaying});
                }
            }
        });

        socket.on("Name-I", function(msg){
            //sand answer picture path list to preocess

            //ws2Painting.send(msg);
            ws2Painting.send(JSON.stringify({
                "Command": "gameTarget",
                "path" : gameAnswerPicPath
            }));
            // dai.push("Name_I", [msg]);
            console.log("Name-I ", msg, "\n", gameAnswerPicPath);
        });

        socket.on("Correct", function(msg){
            //ws2Painting.send("Correct");
            ws2Painting.send(JSON.stringify({
                "Command": "Correct"
            }));
            // dai.push("Correct", [1]);
            console.log("Correct");
        });
        
        socket.on("Wrong", function(msg){
            //ws2Painting.send("Wrong");
            ws2Painting.send(JSON.stringify({
                "Command": "Wrong"
            }));
            // dai.push("Wrong", [1]);
            console.log("Wrong");
        });

        socket.on("NewGameReq", function(msg){
            //if user want to play game, generate game info for him

            //ganerate new gameinfo
            gameInfo = utils.generateGame(preAnswerID, answerIDList, nameIDList, nameList);
            gameList = gameInfo[0];
            gameAnswerPicPath = gameInfo[1];
            preAnswerID = gameInfo[2];

            socket.emit("NewGameRes", {"gameList": gameList});

            // dai.push("NextGame", [1]);
            console.log("NextGame");
        });
    });
};


/* nameList structure
    [   { info: '湯姆克魯斯,tom cruise,1951-',
          path: { order: pic_path }
        },
    ]
*/
var nameList = [],
    nameIDList = [],
    answerIDList = [],
    gameInfo,
    gameList,
    gameAnswerPicPath,
    preAnswerID = "",
    url = shortid.generate();

console.log("----Game url----\n", url);

//static files
app.use(express.static("../web"));

app.use(bodyParser.urlencoded({
    extended: true,
}));

// process http body
app.use(bodyParser.json());

//[TODO]
function generateAnswerIDListAndThenStartServer(){
    db.Group.findAll( { where: {status: 1} }).then(GroupList => {
        var group_count = 0,
            index;

        //check there is no initial answerIDList (no using group)
        if(GroupList.length == 0){
            //start server

            //let default answerIDList to all approved question
            answerIDList = nameIDList;

            console.log('---server start without any using group---');
            http.listen((process.env.PORT || config.webServerPort), '0.0.0.0');
            return;
        }

        GroupList.forEach((GroupSetItem) => { 
            var GroupData = GroupSetItem.get({ plain: true });

            db.GroupMember.findAll({ //find all questions in this selected group
                where: { GroupId: GroupData.id }
            }).then(GroupMemberList => {
                var groupmember_count = 0;

                GroupMemberList.forEach((GroupMemberSetItem) => { 
                    var GroupMemberData = GroupMemberSetItem.get({ plain: true });

                    db.Question.findOne({ //for every single question get info and pic
                        where: { id: GroupMemberData.question_id },
                        include: [
                            { model: db.Human },
                            { model: db.Picture }
                        ]
                    }).then(function(q){
                        if(q != null){
                            groupmember_count += 1;

                            var pic_dict = {},
                                info = q.Human.chi_name + "," + q.Human.eng_name + "," + 
                                       q.Human.birth_year + "-" + q.Human.death_year;
                            q.Pictures.forEach((picture) => {
                                pic_dict[picture.order] = picture.id;
                            });

                            //check answerIDList duplicate,
                            //if false, push ID into answerIDList
                            //if true, do nothing

                            index = answerIDList.indexOf(GroupMemberData.question_id);
                            if (index > -1) { //duplicate
                                console.log("got duplicate question_id, pass it !");
                            }
                            else{
                                answerIDList.push(GroupMemberData.question_id);
                            }

                            if(groupmember_count == GroupMemberList.length){
                                group_count += 1;
                                if(group_count == GroupList.length){
                                    
                                    console.log("---setting answerIDList---");
                                    console.log(answerIDList);

                                    //start server
                                    console.log('---server start---');
                                    http.listen((process.env.PORT || config.webServerPort), '0.0.0.0');
                                }
                            }
                        }
                    });
                });
            });
        });
    });
}

//[TODO] get all question into nameList
http.listen((process.env.PORT || config.webServerPort), '0.0.0.0')
// db.Class.findOne({ where: {name : "human"}}).then(function(c){
//     if(c != null){
//         db.Question.findAll({ 
//             where: {ClassId: c.id, status: 1},
//             include: [
//                 { model: db.Human },
//                 { model: db.Picture }
//             ]
//         }).then(QuestionList => {

//             //first server start case
//             if(QuestionList.length == 0){
//                 //get answerIDList from using Group and start server
//                 generateAnswerIDListAndThenStartServer();
//                 return true;
//             }

//             var count = 0

//             QuestionList.forEach((QuestionSetItem) => {
//                 count += 1;

//                 var QuestionData = QuestionSetItem.get({ plain: true });
//                 var human_data = QuestionData.Human,
//                     picture_data = QuestionData.Pictures,
//                     info, pic_dict = {};

//                 info = human_data.chi_name + ',' + human_data.eng_name + ',' + 
//                        human_data.birth_year + '-' + human_data.death_year;
                
//                 picture_data.forEach((picture) => {
//                     pic_dict[picture.order] = picture.id;
//                 });

//                 nameIDList.push(QuestionData.id);
//                 nameList.push({
//                     info: info,
//                     path: pic_dict
//                 });

//                 if(count == QuestionList.length){
//                     console.log('---load all approved questions in server---');
//                     console.log(nameIDList);
//                     console.log(nameList);

//                     //get answerIDList from using Group and start server
//                     generateAnswerIDListAndThenStartServer();
//                 }
//             });
//         });
//     }
// });

/* APIs */
// authentication url API
app.post("/url",function(req, res){
    if(req.body.accessToken == config.accessToken){
        url = shortid.generate();
        console.log(url);
        var fullUrl = req.protocol + '://' + req.get('host') + '/' + url;
        utils.sendResponse(res, 200, fullUrl);
    }
    else{
        utils.sendResponse(res, 403, "permission denied");
    }
});

// get getClass API
//mode: all, pending, approved
app.get("/getClass", function(req, res){
    console.log('---getClass---');
    var mode = req.query.mode,
        class_list = [];

    console.log("mode: ", mode);
    if(mode == "all"){
        db.Class.findAll().then(ClassList => {
            var count = 0;

            ClassList.forEach((ClassSetItem) => {
                var ClassData = ClassSetItem.get({ plain: true });

                class_list.push({
                    id: ClassData.id,
                    name: ClassData.name,
                    sample_name: ClassData.sample_name,
                    description: ClassData.description
                });
                
                count += 1;
                if(count == ClassList.length){
                    console.log(class_list);

                    //send response
                    utils.sendResponse(res, 200, JSON.stringify(class_list));
                }
            });
        });
    }
    else if(mode == "pending"){
        db.Class.findAll().then(ClassList => {
            var count = 0;

            ClassList.forEach((ClassSetItem) => {
                var ClassData = ClassSetItem.get({ plain: true });

                db.Question.findAll({ where: {
                    ClassId: ClassData.id,
                    status: 0
                }}).then(QuestionList =>{
                    if(QuestionList.length > 0){
                        class_list.push({
                            id: ClassData.id,
                            name: ClassData.name,
                        });
                    }

                    count += 1;
                    if(count == ClassList.length){
                        console.log(class_list);

                        //send response
                        utils.sendResponse(res, 200, JSON.stringify(class_list));
                    }
                });
            });
        });
    }
    else if(mode == "approved"){
        db.Class.findAll().then(ClassList => {
            var count = 0;

            ClassList.forEach((ClassSetItem) => {
                var ClassData = ClassSetItem.get({ plain: true });

                db.Question.findAll({ where: {
                    ClassId: ClassData.id,
                    status: 1
                }}).then(QuestionList =>{
                    if(QuestionList.length > 0){
                        class_list.push({
                            id: ClassData.id,
                            name: ClassData.name,
                        });
                    }

                    count += 1;
                    if(count == ClassList.length){
                        console.log(class_list);

                        //send response
                        utils.sendResponse(res, 200, JSON.stringify(class_list));
                    }
                });
            });
        });
    }
});

// get Category API
//mode: all, using
app.get("/getCategory", function(req, res){
    console.log('---getCategory---');
    var mode = req.query.mode,
        target_class_name = req.query.class_name;

    console.log("mode: ", mode);
    if(mode == "all"){
        var category_list = [];

        console.log("finding all category in Class:", target_class_name, "...");
        db.Class.findOne({ 
            where: { name: target_class_name} 
        }).then(function(c){
            if(c != null){
                var count = 0;

                db.Category.findAll({ 
                    where: { ClassId: c.id }
                }).then(CategoryList => {
                    if(CategoryList.length == 0){ //this class has no category
                        //response
                        utils.sendResponse(res, 200, JSON.stringify(category_list));
                    }

                    CategoryList.forEach((CategorySetItem) => {
                        var CategoryData = CategorySetItem.get({ plain: true });

                        //push into list
                        category_list.push({
                            id : CategoryData.id,
                            name : CategoryData.name
                        });

                        count += 1;
                        if(count == CategoryList.length){
                            console.log(category_list);

                            //response
                            utils.sendResponse(res, 200, JSON.stringify(category_list));
                        }
                    });
                });
            }
        });
    }
    else if(mode == "using"){
        var usingCategory_list = [];

        console.log("finding used category in Class", target_class_name, " ...");
        db.Class.findOne({ where: {name: target_class_name} }).then(function(c){
            if(c != null){
                var count = 0;

                db.Category.findAll({ where: { ClassId: c.id } }).then(CategoryList => {
                    CategoryList.forEach((CategorySetItem) => {
                        var CategoryData = CategorySetItem.get({ plain: true });

                        // make sure there are humans belong to this category
                        db.QuestionCategory.findAll({ 
                            where: { category_id: CategoryData.id }
                        }).then(QuestionCategoryList => {
                            count += 1;

                            if(QuestionCategoryList.length != 0){
                                //push into list
                                usingCategory_list.push({
                                    id : CategoryData.id,
                                    name : CategoryData.name
                                });
                            }

                            if(count == CategoryList.length){
                                console.log(usingCategory_list);

                                //response
                                utils.sendResponse(res, 200, JSON.stringify(usingCategory_list));
                            }
                        });
                    });
                });
            }
        });
    }
});

// post addNewCategory API
app.post('/addNewCategory', function(req, res){
    console.log('---addNewCategory---');
    var class_id = req.body.class_id,
        class_name = req.body.class_name,
        new_category_name = req.body.new_category_name,
        data = {};

    db.Class.findOne({ where: {id: class_id} }).then(function(c){
        if(c != null){
            db.Category.create({ 
                ClassId : c.id,
                name : new_category_name
            }).then(function(){
                db.Category.findOne({ where: { 
                        ClassId: c.id,
                        name : new_category_name
                }}).then(function(ca){
                    if(ca != null){
                        data["id"] = ca.id;
                        data["name"] = ca.name;

                        console.log(data);

                        //response
                        utils.sendResponse(res, 200, JSON.stringify(data));
                    }
                });
            });
        }
    });
});

// post questionUpload API
app.post('/questionUpload', function (req, res) {
    console.log("---questionUpload---");
    var question_id = utils.uuid().substring(0,16),
        user_upload_data = {}, img_order = {},
        qname = "", description = "", save_path = "",
        pictures = [], questionCategories = [], photo_path = [],
        photo_status = true, class_id,
        form = new formidable.IncomingForm();

    form.multiples = true;
    form.uploadDir = path.join(__dirname, 'upload_cache');

    form.on('field', function(name, field) {
        if(name == "user_upload_data"){
            user_upload_data = JSON.parse(field);
            class_id = user_upload_data["class_id"];
            qname = user_upload_data["name"];
            description = user_upload_data["description"];
            img_order = user_upload_data["img_order"];
            questionCategories = user_upload_data["selected_category"];

            console.log(user_upload_data);
        }
    });

    form.on('file', function (name, file) {
        var buffer = null, type = null, order = 0,
            picture_id = utils.uuid().substring(0,16);

        buffer = readChunk.sync(file.path, 0, 262);
        type = fileType(buffer);
        photo_path.push(file.path);

        // Check the file type, must be either png, jpg or jpeg
        if(type !== null && (type.ext === 'png' || type.ext === 'jpg' || type.ext === 'jpeg')) {
            save_path = "../web/img/" + picture_id + "." + type.ext;
            fs.rename(file.path, save_path, function(err, result) {
                if(err) console.log('error', err);
            });

            //find corresponding index from img_order
            if(img_order.hasOwnProperty(file.name)){
                order = img_order[file.name];
            }

            //add to pictures list for db create
            pictures.push({
                id: picture_id + "." + type.ext,
                order: order,
                origin_name: file.name
            });

            console.log(file.name, picture_id, order);
        }
        else {
            console.log(file.name, " suck");

            //dirty file
            photo_status = false;
        }
    });

    form.on('error', function(err) {
        console.log('Error occurred during processing - ' + err);
    });

    form.on('end', function() {
        console.log('All the request fields have been processed.');
    });

    // Parse the incoming form fields.
    form.parse(req, function (err, fields, files) {
        if(photo_status){
            //create this question to related db
            console.log("start create this question...");
            db.Class.findOne({ where: {id: class_id} }).then(function(c){
                if(c != null){
                    var data = {
                        id : question_id,
                        name : qname,
                        description : description,
                        status : 0,
                        ClassId: c.id,
                        QuestionCategories : questionCategories,
                        Pictures : pictures
                    };
                    db.Question.create(data, {include: [db.QuestionCategory, db.Picture]}).then(function(){
                        console.log(question_id, " created!!");

                        //send success response
                        utils.sendResponse(res, 200, JSON.stringify({photo_status: 1}));
                    });
                }
            });
        }
        else{
            console.log("this question upload fail");
            //delete all files
            for(var path in photo_path){
                fs.unlink(path, (err) => {
                    if(err){
                        console.log(path, " cannot be delete Q");
                    }
                });
            }
            //send failed response
            utils.sendResponse(res, 200, JSON.stringify({photo_status: 0}));
        }
    });
});

// get getQuestion API
//mode: all, one, category ; status: 0, 1
app.get("/getQuestion", function(req, res){
    console.log("---getQuestion---");
    var mode = req.query.mode,
        class_id = req.query.class_id;

    console.log("mode: ", mode);
    if(mode == "all"){
        var status = req.query.status,
            pending_list = [];

        console.log("get question with class:", class_id, "and status:",status);
        db.Class.findOne({ where: {id: class_id} }).then(function(c){
            if(c != null){
                db.Question.findAll({
                    where: { 
                        status: status,
                        ClassId: c.id,
                    }
                }).then(QuestionList => {
                    QuestionList.forEach((QuestionSetItem) => {
                        var QuestionData = QuestionSetItem.get({ plain: true });
                        
                        pending_list.push({
                            id : QuestionData.id,
                            name : QuestionData.name,
                            description : QuestionData.description
                        });
                    });
                    console.log(pending_list);
                    
                    //response
                    utils.sendResponse(res, 200, JSON.stringify(pending_list));
                });
            }
        });
    }
    else if(mode == "one"){
        var question_id = req.query.question_id,
            usingCategory_dict = {},
            questionData = {};

        console.log("get question:", question_id, "all data");
        db.Class.findOne({ where: {id: class_id} }).then(function(c){
            if(c != null){
                //find all human category for check which this human has checked
                db.Category.findAll({ where: { ClassId: c.id } }).then(CategoryList => {
                    CategoryList.forEach((CategorySetItem) => {
                        var CategoryData = CategorySetItem.get({ plain: true });
                            usingCategory_dict[CategoryData.id.toString()] = CategoryData.name;
                        });

                    //find pending human by id
                    db.Question.findOne({
                        where: { 
                            id: question_id,
                            ClassId: c.id,
                        },
                        include: [
                            { model: db.Picture },
                            { model: db.QuestionCategory}
                        ]
                    }).then(QuestionObject => {
                        var QuestionData = QuestionObject.get({ plain: true });

                        //sort picture by order
                        var picId, sortedPic_list = [];
                        for(var i = 0; i < QuestionData.Pictures.length; i++){
                            picId = utils.getPicIdbyOrder(QuestionData.Pictures, i + 1);
                            if(picId != "none"){
                                sortedPic_list.push(picId);
                            }
                        }

                        //mark checked category
                        var checkedCategory_list = [];
                        for(var categoryId in usingCategory_dict){
                            if(usingCategory_dict.hasOwnProperty(categoryId)){
                                //console.log(key, usingCategory_dict[categoryId]);
                                var used = utils.checkCategoryused(QuestionData.QuestionCategories, categoryId);
                                checkedCategory_list.push({
                                    id: categoryId,
                                    name: usingCategory_dict[categoryId],
                                    used: used
                                });
                            }
                        }

                        //set human data
                        questionData["name"] = QuestionData.name;
                        questionData["description"] = QuestionData.description;

                        //set sorted picture data
                        questionData["picture"] = sortedPic_list;

                        //set sorted picture data
                        questionData["category"] = checkedCategory_list;

                        console.log(questionData);

                        //response
                        utils.sendResponse(res, 200, JSON.stringify(questionData));
                    });
                });
            }
        });
    }
    else if(mode == "category"){
        var target_category_id = req.query.category_id,
            question_list = [];

        console.log("get question with class:", class_id, "and category_id:", target_category_id);
        db.QuestionCategory.findAll({
            where: { category_id: target_category_id }
        }).then(QuestionCategoryList => {
            //count for all search done
            var count = 0;
            
            //if there is no human belongs to this category, return
            if(QuestionCategoryList.length == 0){
                console.log(question_list);
                console.log("no human in this category");

                //response
                utils.sendResponse(res, 200, JSON.stringify(question_list));
                return false;
            }

            QuestionCategoryList.forEach((QuestionCategorySetItem) => {
                var QuestionCategoryData = QuestionCategorySetItem.get({ plain: true });
                db.Question.findOne({
                    where: {id: QuestionCategoryData.QuestionId, status: 1},
                }).then(function(q){
                    count += 1;

                    if(q != null){
                        question_list.push({
                            id: q.id,
                            info: q.name + q.description
                        });
                    }

                    if(count == QuestionCategoryList.length){
                        console.log(question_list);

                        //response
                        utils.sendResponse(res, 200, JSON.stringify(question_list));
                    }
                });
            });
        });
    }
});

// put questionUpdate API
app.put('/questionUpdate', function (req, res) {
    var user_update_data = req.body.user_update_data,
        question_id = user_update_data.id,
        new_name = user_update_data.name,
        new_description = user_update_data.description,
        new_img_order = user_update_data.img_order,
        new_selected_category = user_update_data.selected_category,
        index;

    console.log("---questionUpdate---");
    console.log(user_update_data);
    //update this question for related db
    db.Question.update( //update question status
        { status: 1, 
          name: new_name, 
          description: new_description },
        { where: { id: question_id }}
    ).then(function(){
        //update question category
        db.QuestionCategory.destroy({ //destroy old question category
            where: { QuestionId: question_id }, 
            force:true 
        }).then(function(){ //create new question category
            var new_selected_category_list = [];
            new_selected_category.forEach((element)=>{
                new_selected_category_list.push({
                    category_id: element,
                    QuestionId: question_id
                });
            });
            db.QuestionCategory.bulkCreate(new_selected_category_list).then(function() {
                //update picture order
                db.Picture.findAll({ where: { QuestionId: question_id } }).then(PictureList => {
                    var count = 0;
                    PictureList.forEach((PictureSetItem) => {
                        var PictureData = PictureSetItem.get({ plain: true });
                        db.Picture.update(
                            { order: new_img_order[PictureData.id] }, 
                            { where: { id: PictureData.id } } 
                        ).then(function(){
                            count += 1;
                            console.log(PictureData.id, " update success");
                            if(count == PictureList.length){
                                var info_str = new_name + new_description;

                                //update this human in nameList
                                index = nameIDList.indexOf(question_id);
                                if(index > -1){ //exist
                                    //get new question path
                                    nameList[index].path = {}; //flush old pic path
                                    for(var key in new_img_order) {
                                        nameList[index].path[new_img_order[key]] = key;
                                    }

                                    //set new question info
                                    nameList[index].info = info_str;

                                    //set new question path
                                    console.log("---update", question_id, "in nameList---");
                                    console.log(nameList[index].info);
                                    console.log(nameList[index].path);
                                    // console.log(nameList);
                                }
                                else{ //pending -> approved, append into nameList
                                    var pic_dict = {};

                                    for(var key in new_img_order) {
                                        pic_dict[new_img_order[key]] = key;
                                    }

                                    nameIDList.push(question_id);
                                    nameList.push({
                                        info: info_str,
                                        path: pic_dict
                                    });
                                    console.log('---add', question_id, 'into nameList---');
                                    console.log(info_str);
                                    console.log(pic_dict);
                                }

                                //send response
                                utils.sendResponse(res, 200, "success!");
                            }
                        });
                    });
                });
            });
        });
    });
});

// delete questionDelete API
app.delete('/questionDelete', function(req, res){
    var delete_question_id = req.body.delete_question_id,
        index, using_flag = false;

    /* delete this question from all related tables */
    console.log("---questionDelete---");
    console.log("checking:", delete_question_id, "...");
    //check this question using or not
    db.Group.findAll({ where: {status: 1} }).then(GroupList => { //get all using Group
        var count = 0;

        //special case, server has no using Group
        if(GroupList.length == 0){
            console.log("there is no using group in server now");
            console.log(delete_question_id, "is safe to be deleted");

            //send response
            utils.sendResponse(res, 200, JSON.stringify({using: 0}));
        }

        GroupList.forEach((GroupSetItem) => {
            var GroupData = GroupSetItem.get({ plain: true });
            
            //find this question in those using Group
            db.GroupMember.findOne({
                where:{ 
                    question_id: delete_question_id, 
                    GroupId: GroupData.id
                }
            }).then(function(c){
                count += 1;

                if(c != null){
                    //this question is using now cannot be deleted
                    using_flag = true;
                }

                if(count == GroupList.length){
                    //search done
                    if(using_flag){
                        console.log(delete_question_id, "is using, cannot be deleted");

                        //send response "OPERATION DENIED"
                        utils.sendResponse(res, 200, JSON.stringify({using: 1}));
                    }
                    else{
                        //delete, send response "SUCCESS"
                        console.log(delete_question_id, "is safe to be deleted");
                        
                        //unlink related picture files from server
                        db.Picture.findAll({ where: {QuestionId: delete_question_id} }).then(PictureList => {
                            var pic_count = 0;

                            PictureList.forEach((PictureSetItem) => {
                                var PictureData = PictureSetItem.get({ plain: true });
                                var path = '../web/img/' + PictureData.id;

                                fs.unlink(path, (err) => {
                                    if(err) console.log(PictureData.id, ' cannot be deleted');
                                    else    console.log(PictureData.id, ' deleted');
                                });

                                pic_count += 1;
                                if(pic_count == PictureList.length){
                                    //delete all picture files from server storage
                                    console.log("all pictures have been successfully deleted from server storage");
                                    db.Picture.destroy({
                                        where: { QuestionId: delete_question_id }, force:true 
                                    }).then(function(){
                                        //destroy this question from category
                                        db.QuestionCategory.destroy({ 
                                            where: { QuestionId: delete_question_id }, force:true 
                                        }).then(function(){
                                            //destroy this question from question
                                            db.Question.destroy({ 
                                                where: { id: delete_question_id }, force:true 
                                            }).then(function(){
                                                console.log("delete ", delete_question_id, " success");

                                                //remove this question from nameIDList and nameList
                                                index = nameIDList.indexOf(delete_question_id);
                                                if(index > -1){ //exist
                                                    nameIDList.splice(index, 1);
                                                    nameList.splice(index, 1);
                                                    console.log("delete this ", delete_question_id, " from nameList, nameIDList");
                                                    // console.log(nameList);
                                                }

                                                //remove this question from answerIDList
                                                index = answerIDList.indexOf(delete_question_id);
                                                if(index > -1){ // exist
                                                    answerIDList.splice(index, 1);
                                                    console.log("delete this ", delete_question_id, " from answerIDList");
                                                }

                                                //send response
                                                utils.sendResponse(res, 200, JSON.stringify({using: 0}));
                                            });
                                        });
                                    });
                                }
                            });
                        });
                    }
                }
            });
        });
    });
});

// get getGroup API
//mode: all, one
app.get('/getGroup', function(req, res){
    var mode = req.query.mode;

    console.log("---getGroup---");
    console.log("mode:", mode);
    if(mode == "all"){
        var group_list = [];

        db.Group.findAll().then(GroupList => {
            GroupList.forEach((GroupSetItem) => {
                var GroupData = GroupSetItem.get({ plain: true });
                
                group_list.push({
                    id : GroupData.id,
                    name : GroupData.name,
                    status : GroupData.status
                });
            });
            
            console.log(group_list);

            //response
            utils.sendResponse(res, 200, JSON.stringify(group_list));
        });
    }
    else if(mode == "one"){
        var target_group_id = req.query.group_id,
            groupMember_list = [];

        console.log("get all member from group_id:", target_group_id);
        db.GroupMember.findAll({ where: { GroupId: target_group_id } }).then(GroupMemberList => {
            var count = 0;

            GroupMemberList.forEach((GroupMemberSetItem) => {
                var GroupMemberData = GroupMemberSetItem.get({ plain: true });
                
                db.Question.findOne({ 
                    where: { id: GroupMemberData.question_id } 
                }).then(function(q){
                    if(q != null){
                        groupMember_list.push({
                            question_id: q.id,
                            name: q.name,
                            description: q.description
                        });
                    }

                    count += 1;
                    if(count == GroupMemberList.length){
                        console.log(groupMember_list);
                        
                        //send response
                        utils.sendResponse(res, 200, JSON.stringify(groupMember_list));
                    }
                });
            });
        });
    }
});

// psot addNewHumanGroup API
app.post('/addNewGroup', function(req, res){
    var group_name = req.body.newgroup_name,
        group_list = req.body.group_list;

    console.log("---addNewGroup---");
    console.log("new group name:", group_name);
    console.log("new group member:", group_list);

    var data = {
        name : group_name,
        status : 0,
        GroupMembers : group_list
    };

    db.Group.create(data, {include: [db.GroupMember]}).then(function(){
        // response
        utils.sendResponse(res, 200, "success!");
    });
});

// delete deleteGroup API
app.delete('/deleteGroup', function(req,res){
    var delete_group_id = req.body.delete_group_id;
    console.log("---deleteGroup---");
    
    db.GroupMember.destroy({ 
        where: { GroupId: delete_group_id }, force: true 
    }).then(function(){
        db.Group.destroy({
            where: { id: delete_group_id }, force: true
        }).then(function(){
            console.log("group_id:", delete_group_id, "successfully deleted");

            //send response
            utils.sendResponse(res, 200, "success!");
        });
    });
});

// put updateGroup API
app.put('/updateGroup', function(req, res){
    var update_group_id = req.body.update_group_id,
        group_list = req.body.group_list,
        index;

    console.log("---updateGroup---");
    console.log("group_id:", update_group_id, "updating...");
    //destroy old member
    db.GroupMember.destroy({ 
        where: { GroupId: update_group_id }, force:true 
    }).then(function(){ 
        var new_groupmember_list = [];
        group_list.forEach((element)=>{
            new_groupmember_list.push({
                question_id: element.question_id,
                GroupId: update_group_id
            });
        });

        //create new mamber
        db.GroupMember.bulkCreate(new_groupmember_list).then(function(){
            console.log("update finish, checking group using or not");
            //if this group is using, re-create answerIDList
            db.Group.findOne({ where: {id: update_group_id}}).then(function(c){
                if(c != null){
                    //check this group is using or not
                    if(c.status){ // modify using group, re-create answerIDList
                        //flush answerIDList to null
                        answerIDList = [];

                        db.Group.findAll({ where: {status: 1} }).then(GroupList => {
                            var group_count = 0;

                            GroupList.forEach((GroupSetItem) =>{
                                var GroupData = GroupSetItem.get({ plain: true });

                                db.GroupMember.findAll({ 
                                    where: { GroupId: GroupData.id }
                                }).then(GroupMemberList => {
                                    var groupmember_count = 0;

                                    GroupMemberList.forEach((GroupMemberSetItem) => { 
                                        var GroupMemberData = GroupMemberSetItem.get({ plain: true });

                                        groupmember_count += 1;

                                        index = answerIDList.indexOf(GroupMemberData.question_id);
                                        if(index > -1){ //exist
                                            //do nothing
                                        }
                                        else{
                                            answerIDList.push(GroupMemberData.question_id);
                                        }

                                        if(groupmember_count == GroupMemberList.length){
                                            group_count += 1;
                                            if(group_count == GroupList.length){
                                                console.log('modify using Group, server re-create answerIDList');
                                                console.log(answerIDList);

                                                //send response
                                                utils.sendResponse(res, 200, "success");
                                            }
                                        }
                                    });
                                });
                            });
                        });
                    }
                    else{
                        console.log('modify no using Group, server do nothing to answerIDList');

                        //send response
                        utils.sendResponse(res, 200, "success");
                    }
                }
            });
        });
    });
});

//put setDisplayGroup API
app.put('/setDisplayGroup', function(req, res){
    var selected_group_list = req.body.selected_group_list,
        index;

    //flush answerIDList to null
    answerIDList = [];

    console.log("---setDisplayGroup---");
    console.log("display group:", selected_group_list);
    db.Group.update( //let all group set to unuse
        { status: 0 },
        { where: {status: 1} }
    ).then(function(){
        var group_count = 0;

        selected_group_list.forEach((selected_group) => { //set selected group to use
            db.Group.update(
                { status: 1 },
                { where: {id: selected_group.id} }
            ).then(function(){
                //load all question into answerIDList
                console.log('modify using Group, server re-create answerIDList');
                db.GroupMember.findAll({ //find all questions in this selected group
                    where: { GroupId: selected_group.id }
                }).then(GroupMemberList => {
                    var groupmember_count = 0;

                    GroupMemberList.forEach((GroupMemberSetItem) => { 
                        var GroupMemberData = GroupMemberSetItem.get({ plain: true });

                        index = answerIDList.indexOf(GroupMemberData.question_id);
                        if(index > -1){ //exist
                            //do nothing
                        }
                        else{
                            answerIDList.push(GroupMemberData.question_id);
                        }

                        groupmember_count += 1;
                        if(groupmember_count == GroupMemberList.length){
                            group_count += 1;
                            if(group_count == selected_group_list.length){
                                console.log(answerIDList);
                                
                                //send response
                                utils.sendResponse(res, 200, "success");
                            }
                        }
                    });
                });
            });
        });
    });
});

/* web page */
// manage page
app.get("/manage", utils.auth, function(req, res){
    fs.readFile("../web/html/manage.html", function (err, contents) {
        if (err){ console.log(err); }
        else{
            contents = contents.toString('utf8');
            utils.sendResponse(res, 200, contents);
        }
    });
});

// user page
// app.get("/:lang(ch|en)/user", function(req, res){
//     fs.readFile("../web/html/user_" + req.params.lang + ".html", 
//         function(err, contents){
//             if (err){ console.log(err); }
//             else{
//                 contents = contents.toString('utf8');
//                 utils.sendResponse(res, 200, contents);
//             }
//     });
// });
app.get("/user", function(req, res){
    fs.readFile("../web/html/user.html", 
        function(err, contents){
            if (err){ console.log(err); }
            else{
                contents = contents.toString('utf8');
                utils.sendResponse(res, 200, contents);
            }
    });
});

// other page
app.get("/*", function(req, res){
    if(req.originalUrl.substr(1) != url && 
        req.originalUrl.substr(1) != "user" && 
        req.originalUrl.substr(1) != "manage"){
        fs.readFile("../web/html/endPage.html", function (err, contents) {
            if(err){ console.log(err); }
            else{
                contents = contents.toString('utf8');
                utils.sendResponse(res, 200, contents);
            }
        });
        return;
    }
    else{
        fs.readFile("../web/html/index.html", function(err, contents){
            if(err){ console.log(err); }
            else if(isGamePlaying){
                fs.readFile("../web/html/endPage.html", function(err, contents){
                    if(err){ console.log(err); }
                    else{
                        contents = contents.toString('utf8');
                        utils.sendResponse(res, 200, contents);
                    }
                });
            }
            else{
                // random generate at least 6 question info list to front-end webpage
                // also decide the targeted answer
                gameInfo = utils.generateGame(preAnswerID, answerIDList, nameIDList, nameList);
                gameList = gameInfo[0];
                gameAnswerPicPath = gameInfo[1];
                preAnswerID = gameInfo[2];

                contents = contents.toString('utf8');
                utils.sendEjsRenderResponse(res, 200, contents, {
                    gameList: gameList, 
                    webSocketPort: config.webSocketPort, 
                    webServerPort: config.webServerPort,
                    paintingIP: config.paintingIP
                });
            }
        });
    }
});
