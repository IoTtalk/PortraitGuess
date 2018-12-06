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
            //[TODO] if user want to play game, generate game info for him

            //ganerate new gameinfo
            gameInfo = utils.generateGame(nameList);
            gameList = gameInfo[0];
            gameAnswerPicPath = gameInfo[1];

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
    gameInfo,
    gameList,
    gameAnswerPicPath,
    url = shortid.generate();

console.log("----Game url----\n", url);

//static files
app.use(express.static("../web"));

app.use(bodyParser.urlencoded({
    extended: true,
}));

// process http body
app.use(bodyParser.json());

// get initialize nameList and then start server
db.Group.findAll( { where: {status: 1} }).then(GroupList => {
    var group_count = 0;

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
                }).then(function(c){
                    if(c != null){
                        groupmember_count += 1;

                        var pic_dict = {},
                            info = c.Human.chi_name + "," + c.Human.eng_name + "," + 
                                   c.Human.birth_year + "-" + c.Human.death_year;
                        c.Pictures.forEach((picture) => {
                            pic_dict[picture.order] = picture.id;
                        });

                        nameList.push({
                            info: info,
                            path: pic_dict
                        });

                        if(groupmember_count == GroupMemberList.length){
                            group_count += 1;
                            if(group_count == GroupList.length){
                                
                                console.log("---initialize nameList---");
                                console.log(nameList);
                                console.log("---initialize nameList---");

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
app.get("/:lang(ch|en)/user", function(req, res){
    fs.readFile("../web/html/user_" + req.params.lang + ".html", 
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
                gameInfo = utils.generateGame(nameList);
                gameList = gameInfo[0];
                gameAnswerPicPath = gameInfo[1];

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

// post get Human Category API
app.post("/getHumanCategory", function(req, res){
    var humanCategory_list = [];

    db.Class.findOne({ where: {name: 'human'} }).then(function(c){
        if(c != null){
            var count = 0;

            db.Category.findAll({ 
                where: { ClassId: c.id }
            }).then(CategoryList => {
                CategoryList.forEach((CategorySetItem) => {
                    var CategoryData = CategorySetItem.get({ plain: true });

                    // make sure there are humans belong to this category
                    db.QuestionCategory.findAll({ 
                        where: { category_id: CategoryData.id }
                    }).then(QuestionCategoryList => {
                        count += 1;

                        if(QuestionCategoryList.length != 0){
                            //push into list
                            humanCategory_list.push({
                                id : CategoryData.id,
                                name : CategoryData.name
                            });
                        }

                        if(count == CategoryList.length){
                            console.log(humanCategory_list);

                            //response
                            utils.sendResponse(res, 200, JSON.stringify(humanCategory_list));
                        }
                    });
                });
            });
        }
    });
});

// post getPendingHuman API
app.post("/getHuman", function(req, res){
    var status = req.body.status,
        Human_list = [];

    db.Class.findOne({ where: {name: 'human'} }).then(function(c){
        if(c != null){
            db.Question.findAll({
                where: { 
                    status: status,
                    ClassId: c.id,
                },
                include: [
                    { model: db.Human }
                ]
            }).then(QuestionList => {
                QuestionList.forEach((QuestionSetItem) => {
                    var QuestionData = QuestionSetItem.get({ plain: true });
                    Human_list.push({
                        id : QuestionData.id,
                        info : QuestionData.Human,
                    });
                });
                console.log(Human_list);
                
                //response
                utils.sendResponse(res, 200, JSON.stringify(Human_list));
            });
        }
    });
});

// post getGroup API
app.post('/getGroup', function(req, res){
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
        
        console.log("---group---");
        console.log(group_list);
        console.log("---group---");

        //response
        utils.sendResponse(res, 200, JSON.stringify(group_list));
    });
});

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

// post human upload API
app.post('/humanUpload', function (req, res) {
    var question_id = utils.uuid().substring(0,16),
        user_upload_data = {},
        img_order = {},
        chi_name = "",
        eng_name = "",
        birth_year = "",
        death_year = "",
        save_path = "",
        pictures = [],
        questionCategories = [],
        photo_status = true,
        photo_path = [],
        form = new formidable.IncomingForm();

    form.multiples = true;
    form.uploadDir = path.join(__dirname, 'upload_cache');

    form.on('field', function(name, field) {
        if(name == "user_upload_data"){
            user_upload_data = JSON.parse(field);
            chi_name = user_upload_data["chi_name"];
            eng_name = user_upload_data["eng_name"];
            birth_year = user_upload_data["birth_year"];
            death_year = user_upload_data["death_year"];
            img_order = user_upload_data["img_order"];
            questionCategories = user_upload_data["selected_category"];

            console.log(user_upload_data);
        }
    });

    form.on('file', function (name, file) {
        var buffer = null,
            type = null,
            order = 0,
            picture_id = utils.uuid().substring(0,16);

        buffer = readChunk.sync(file.path, 0, 262);
        type = fileType(buffer);

        photo_path.push(file.path);

        // Check the file type, must be either png, jpg or jpeg
        if(type !== null && (type.ext === 'png' || type.ext === 'jpg' || type.ext === 'jpeg')) {
            //mv file to processing painting dir
            
            // save_path = config.paintingPath + "/" + picture_id + "." + type.ext;
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
            
            //delete failed file
            fs.unlink(file.path, (err) => {
                if(err) throw err;
                console.log(file.name, ' was deleted');
            });
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
            //create this human to related db
            db.Class.findOne({ where: {name: 'human'} }).then(function(c){
                if(c != null){
                    var data = {
                        id : question_id,
                        status : 0,
                        ClassId: c.id,
                        QuestionCategories : questionCategories,
                        Human : {
                            chi_name: chi_name,
                            eng_name: eng_name,
                            birth_year: birth_year,
                            death_year: death_year
                        },
                        Pictures : pictures
                    };
                    db.Question.create(data, {include: [db.QuestionCategory, db.Human, db.Picture]}).then(function(){
                        console.log(question_id, " create!!");
                    });
                }
                else{
                    console.log("upload failed QQ");
                }
            });
        }
        else{
            //delete all files
            for(var path in photo_path){
                fs.unlink(path, (err) => {
                    if(err) throw err;
                });
            }
        }

        //response
        utils.sendResponse(res, 200, JSON.stringify(photo_status));
    });
});

// post add new human category API
app.post('/addNewHumanCategory', function(req, res){
    var new_category_name = req.body.new_category_name,
        data = [];

    db.Class.findOne({ where: {name: 'human'} }).then(function(c){
        if(c != null){
            db.Category.create({ 
                ClassId : c.id,
                name : new_category_name
            }).then(function(){
                db.Category.findAll({ 
                    where: { ClassId: c.id }
                }).then(CategoryList => {
                    CategoryList.forEach((CategorySetItem) => {
                        var CategoryData = CategorySetItem.get({ plain: true });
                        data.push({
                            id : CategoryData.id,
                            name : CategoryData.name
                        });
                    });

                    console.log(data);

                    //response
                    utils.sendResponse(res, 200, JSON.stringify(data));
                });
            });
        }
    });
});

// psot getHumanByCategory API
app.post('/getHumanByCategory', function(req,res){
    var target_category_id = req.body.category_id,
        humanCategory_list = [];

    db.QuestionCategory.findAll({
        where: { category_id: target_category_id }
    }).then(QuestionCategoryList => {
        //count for all search done
        var count = 0;
        
        //if there is no human belongs to this category, return
        if(QuestionCategoryList.length == 0){
            console.log(humanCategory_list);
            console.log("no human in this category");

            //response
            utils.sendResponse(res, 200, JSON.stringify(humanCategory_list));

            return false;
        }

        QuestionCategoryList.forEach((QuestionCategorySetItem) => {
            var QuestionCategoryData = QuestionCategorySetItem.get({ plain: true });
            db.Question.findOne({
                where: {id: QuestionCategoryData.QuestionId},
                include: { model: db.Human },
            }).then(function(c){
                if(c != null){
                    if(c.status){
                        humanCategory_list.push({
                            id: c.id,
                            info: c.Human.chi_name + "," + c.Human.eng_name + "," + c.Human.birth_year + "-" + c.Human.death_year
                        })
                    }

                    count += 1;
                    if(count == QuestionCategoryList.length){
                        console.log(humanCategory_list);
                        console.log("done");

                        //response
                        utils.sendResponse(res, 200, JSON.stringify(humanCategory_list));
                    }
                }
            });
        });
    });
});

// post getHumanAllData API
app.post('/getHumanAllData', function(req, res){
    var questionId = req.body.questionId,
        status = req.body.status,
        humanCategory_dict = {},
        humanData = {};

    db.Class.findOne({ where: {name: 'human'} }).then(function(c){
        if(c != null){
            //find all human category for check which this human has checked
            db.Category.findAll({
                where: { ClassId: c.id }
            }).then(CategoryList => {
                CategoryList.forEach((CategorySetItem) => {
                    var CategoryData = CategorySetItem.get({ plain: true });
                        humanCategory_dict[CategoryData.id.toString()] = CategoryData.name;
                    });

                //find pending human by id
                db.Question.findOne({
                    where: { 
                        id: questionId,
                        status: status,
                        ClassId: c.id,
                    },
                    include: [
                        { model: db.Human },
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
                    for(var categoryId in humanCategory_dict){
                        if(humanCategory_dict.hasOwnProperty(categoryId)){
                            //console.log(key, humanCategory_dict[categoryId]);
                            var used = utils.checkCategoryused(QuestionData.QuestionCategories, categoryId);
                            checkedCategory_list.push({
                                id: categoryId,
                                name: humanCategory_dict[categoryId],
                                used: used
                            });
                        }
                    }

                    //set human data
                    humanData["human"] = {
                        chi_name : QuestionData.Human.chi_name,
                        eng_name : QuestionData.Human.eng_name,
                        birth_year : QuestionData.Human.birth_year,
                        death_year : QuestionData.Human.death_year,
                    };

                    //set sorted picture data
                    humanData["picture"] = sortedPic_list;

                    //set sorted picture data
                    humanData["category"] = checkedCategory_list;

                    console.log(humanData);

                    //response
                    utils.sendResponse(res, 200, JSON.stringify(humanData));
                });
            });
        }
    });
});

// psot addNewHumanGroup API
app.post('/addNewHumanGroup', function(req, res){
    var group_name = req.body.newgroup_name,
        group_list = req.body.group_list;

    console.log("---addNewHumanGroup---");
    console.log(group_name);
    console.log(group_list);
    console.log("---addNewHumanGroup---");
    
    var data = {
        name : group_name,
        status : 0,
        GroupMembers : group_list
    };
    db.Group.create(data, {include: [db.GroupMember]}).then(function(){
        console.log(group_name, " create!!");

        // response
        utils.sendResponse(res, 200, "success!");
    });
});

// post human update API
app.post('/humanUpdate', function (req, res) {
    var user_update_data = req.body.user_update_data,
        question_id = user_update_data.id,
        new_chi_name = user_update_data.chi_name,
        new_eng_name = user_update_data.eng_name,
        new_birth_year = user_update_data.birth_year,
        new_death_year = user_update_data.death_year,
        new_img_order = user_update_data.img_order,
        new_selected_category = user_update_data.selected_category;

    //update this human for related db
    db.Question.update( //update human status
        { status: 1 },
        { where: { id: question_id }}
    ).then(function(){
        db.Human.update( //update human info
            { chi_name: new_chi_name, 
              eng_name: new_eng_name, 
              birth_year: new_birth_year, 
              death_year: new_death_year 
            },
            { where: { QuestionId: question_id } }
        ).then(function(){
            //update human category
            db.QuestionCategory.destroy({ //destroy old human category
                where: { QuestionId: question_id }, 
                force:true 
            }).then(function(){ //create new human category
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

    console.log("--- update ---");
    console.log(user_update_data);
    console.log("--- update ---");
});

// post human delete API
app.post('/humanDelete', function(req, res){
    var delete_human_id = req.body.delete_human_id;

    /* delete this human from all related tables */
    db.GroupMember.destroy({ //destroy this human from group
        where: { question_id: delete_human_id }, 
        force:true 
    }).then(function(){
        //destroy this human from picture
        db.Picture.destroy({ 
            where: { QuestionId: delete_human_id }, 
            force:true 
        }).then(function(){
            //destroy this human from human
            db.Human.destroy({ 
                where: { QuestionId: delete_human_id }, 
                force:true 
            }).then(function(){
                //destroy this human from category
                db.QuestionCategory.destroy({ 
                    where: { QuestionId: delete_human_id }, 
                    force:true 
                }).then(function(){
                    //destroy this human from question
                    db.Question.destroy({ 
                        where: { id: delete_human_id }, 
                        force:true 
                    }).then(function(){
                        console.log("---delete---")
                        console.log("delete ", delete_human_id, " success");
                        console.log("---delete---")

                        //send response
                        utils.sendResponse(res, 200, "success!");
                    });
                });
            });
        });
    });
});

// post deleteOldGroup API
app.post('/deleteOldGroup', function(req,res){
    var delete_group_id = req.body.delete_group_id;
    
    db.GroupMember.destroy({ 
        where: {GroupId: delete_group_id},
        force: true 
    }).then(function(){
        db.Group.destroy({
            where: { id: delete_group_id},
            force: true
        }).then(function(){
            console.log("---deleteOldGroup---");
            console.log(delete_group_id);
            console.log("---deleteOldGroup---");

            //send response
            utils.sendResponse(res, 200, "success!");
        });
    });
});

// post updateOldHumanGroup API
app.post('/updateOldHumanGroup', function(req, res){
    var update_group_id = req.body.update_group_id,
        group_list = req.body.group_list;

    db.GroupMember.destroy({ //destroy old human category
        where: { GroupId: update_group_id }, 
        force:true 
    }).then(function(){ //create new human category
        var new_groupmember_list = [];
        group_list.forEach((element)=>{
            new_groupmember_list.push({
                question_id: element.question_id,
                GroupId: update_group_id
            });
        });

        db.GroupMember.bulkCreate(new_groupmember_list).then(function(){
            console.log("---updateOldHumanGroup---");
            console.log("done");
            console.log("---updateOldHumanGroup---");

            //send response
            utils.sendResponse(res, 200, "success");
        });
    });
});

// post getGroupMember API
app.post('/getGroupMember', function(req, res){
    var GroupId = req.body.GroupId,
        groupMember_list = [];

    db.GroupMember.findAll({ 
        where: { GroupId: GroupId }
    }).then(GroupMemberList => {
        var count = 0;

        GroupMemberList.forEach((GroupMemberSetItem) => {
            var GroupMemberData = GroupMemberSetItem.get({ plain: true });
            // console.log(CategoryData);
            
            db.Human.findOne({ 
                where: {QuestionId: GroupMemberData.question_id} 
            }).then(function(c){
                if(c != null){
                    groupMember_list.push({
                        question_id: GroupMemberData.question_id,
                        chi_name: c.chi_name,
                        eng_name: c.eng_name,
                        birth_year: c.birth_year,
                        death_year: c.death_year
                    });

                    count += 1;
                    if(count == GroupMemberList.length){
                        console.log('---getGroupMember---');
                        console.log(groupMember_list);
                        console.log('---getGroupMember---');
                        
                        //send response
                        utils.sendResponse(res, 200, JSON.stringify(groupMember_list));
                    }
                }
            });
        });
    });
});

//post getDisplayGroup API
app.post('/setDisplayGroup', function(req, res){
    var selected_group_list = req.body.selected_group_list;

    //flush nameList to null
    nameList = [];

    db.Group.update( //let all group set to unuse
        { status: 0 },
        { where: {status: 1} }
    ).then(function(){
        var group_count = 0;

        selected_group_list.forEach((selected_group) =>{ //set selected group to use
            db.Group.update(
                { status: 1 },
                { where: {id: selected_group.id} }
            ).then(function(){
                //load all question into nameList
                db.GroupMember.findAll({ //find all questions in this selected group
                    where: { GroupId: selected_group.id }
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
                        }).then(function(c){
                            if(c != null){
                                groupmember_count += 1;

                                var pic_dict = {},
                                    info = c.Human.chi_name + "," + c.Human.eng_name + "," + 
                                           c.Human.birth_year + "-" + c.Human.death_year;
                                c.Pictures.forEach((picture) => {
                                    pic_dict[picture.order] = picture.id;
                                });

                                nameList.push({
                                    info: info,
                                    path: pic_dict
                                });

                                if(groupmember_count == GroupMemberList.length){
                                    group_count += 1;
                                    if(group_count == selected_group_list.length){

                                        console.log("---setDisplayGroup---");
                                        console.log(nameList);
                                        console.log("---setDisplayGroup---");

                                        //send response
                                        utils.sendResponse(res, 200, "success!");
                                    }
                                }
                            }
                        });
                    });
                });
            });
        });
    });
});
