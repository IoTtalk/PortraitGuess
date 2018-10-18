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
    config = require('./config'),
    bodyParser = require('body-parser'),
    multer  = require('multer'),
    mv = require('mv'),
    dai = require("./dai").dai,
    websocketclient = require("./websocketclient").WebSocketClient,
    utils = require("./utils"),
    path = require('path'),
    formidable = require('formidable'),
    readChunk = require('read-chunk'),
    fileType = require('file-type');

/*** upload ***/
var uploadFolder = './upload_cache/';
utils.createFolder(uploadFolder);
var uploadFolder = './uploads/';
utils.createFolder(uploadFolder);


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    }
});
var upload = multer({ storage: storage });
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
            //ws2Painting.send(msg);
            ws2Painting.send(JSON.stringify({
                "Command": "gameTarget",
                "name" : msg
            }));
            // dai.push("Name_I", [msg]);
            console.log("Name-I ", msg);
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
    });
};

//load all existed portrait
var nameList = utils.getPaintingDBListByPath(config.paintingPath);
//var nameList = utils.getPaintingDBListByName("./db/Top10.txt");
console.log("---- list in memory----\n", nameList);

//create db dir
utils.createFolder("./db/");

//create default db
utils.createPaintingDB("./db/" + config.default_db, nameList);



var url = shortid.generate();
console.log("----Game url----\n", url);

//static files
app.use(express.static("../web"));

app.use(bodyParser.urlencoded({
    extended: true,
}));

// process http body
app.use(bodyParser.json());

// start server
http.listen((process.env.PORT || config.webServerPort), '0.0.0.0');


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

// get index API
app.get("/*", function (req, res) {
    if(req.originalUrl.substr(1) != url && 
        req.originalUrl.substr(1) != "test" && 
        req.originalUrl.substr(1) != "manage"){
        fs.readFile("../web/html/endPage.html", function (err, contents) {
            if (err){
                console.log(err);
            }
            else{
                contents = contents.toString('utf8');
                utils.sendResponse(res, 200, contents);
            }
        });
        return;
    }
    else if(req.originalUrl.substr(1) == "manage"){
        fs.readFile("../web/html/manage.html", function (err, contents) {
            if (err){
                console.log(err);
            }
            else{
                //get all painting dblist
                var dbList = utils.getAllPaintingDBList();
                console.log('------dbList-----\n', dbList);

                //get all portrait name
                var allList = utils.getPaintingDBListByName("./db/" + config.default_db);

                contents = contents.toString('utf8');
                utils.sendEjsRenderResponse(res, 200, contents, {
                    dbList: dbList,
                    nameList: allList
                });
            }
        });
    }
    else{
        fs.readFile("../web/html/index.html", function (err, contents) {
            if (err){
                console.log(err);
            }
            else if(isGamePlaying){
                fs.readFile("../web/html/endPage.html", function (err, contents) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        contents = contents.toString('utf8');
                        utils.sendResponse(res, 200, contents);
                    }
                });
            }
            else{
                contents = contents.toString('utf8');
                utils.sendEjsRenderResponse(res, 200, contents, {
                    nameList: nameList, 
                    webSocketPort: config.webSocketPort, 
                    webServerPort: config.webServerPort,
                    paintingIP: config.paintingIP
                });
            }
        });
    }
});

// post images API
app.post('/upload', function (req, res) {
    var total_files = 0;
        dirName = "",
        saveDir = "",
        photos = [],
        form = new formidable.IncomingForm(),
        index = 0;

    form.multiples = true;
    form.uploadDir = path.join(__dirname, 'upload_cache');

    // Invoked when a file has finished uploading.
    form.on('file', function (name, file) {
        var buffer = null,
            type = null;

        buffer = readChunk.sync(file.path, 0, 262);
        type = fileType(buffer);

        // Check the file type, must be either png,jpg or jpeg
        if (type !== null && (type.ext === 'png' || type.ext === 'jpg' || type.ext === 'jpeg')) {
            //files counter
            total_files++;

            //mv file to processing painting dir
            fs.rename(file.path, saveDir + "/" + file.name, function(err, result) {
                if(err) console.log('error', err);
            });

            // Add to the list of photos
            console.log("file: ", file.name, " upload!!");
            photos.push({
                status: true,
                filename: file.name,
                type: type.ext,
            });
        }
        else {
            console.log("file: ", file.name, " fail QQ");
            photos.push({
                status: false,
                filename: file.name,
                message: 'Invalid file type! [only png/jpg/jpeg]'
            });
            
            //delete failed file
            fs.unlink(file.path, (err) => {
                if(err) throw err;
                console.log(file.name, ' was deleted');
            });
        }
    });

    form.on('field', function(name, field) {
        dirName = field;
        console.log('Got a field:', field);
        saveDir = config.paintingPath + '/' + field;
        utils.createFolder(saveDir);
        console.log(saveDir);
    })

    form.on('error', function(err) {
        console.log('Error occurred during processing - ' + err);
    });

    // Invoked when all the fields have been processed.
    form.on('end', function() {
        console.log('All the request fields have been processed.');
    });

    // Parse the incoming form fields.
    form.parse(req, function (err, fields, files) {
        //append this portait to config.default_db
        utils.addPortraitToPaintingDB("./db/" + config.default_db, dirName);

        //append this portrait to frameDA
        utils.addPortraitToPaintingDB(config.painting_db, dirName);

        //ask processing to reload painting_db
        if(total_files > 0){
            ws2Painting.send(JSON.stringify({
                "Command": "updatePortrait",
                "name" : dirName,
                "total" : total_files
            }));
        }

        //send response
        res.status(200).json(photos);
    });
});

// post createDB API
app.post('/createDB', function(req, res){
    var selectedlist_name = req.body.selected_list_name,
        selected_portrait = req.body.selected_portrait;
    
    //create db file
    utils.createPaintingDB("./db/" + selectedlist_name + ".txt", selected_portrait);

    //update nameList in memory
    nameList = selected_portrait.slice(0);
    console.log("----create new db----\n", selectedlist_name);
    console.log("----update list in memory----\n", nameList);
    
    //response
    utils.sendResponse(res, 200, "success!");
});

// post loadDB API
app.post('/loadDB', function(req, res){
    var selected_db = req.body.selected_db;
    
    //update nameList in memory
    nameList = utils.getPaintingDBListByName("./db/" + selected_db + ".txt");
    console.log("----load db----\n", selected_db);
    console.log("----update list in memory----\n", nameList);

    //response
    utils.sendResponse(res, 200, "success!");
});

// post getAllDB API
app.post('/getAllDB', function(req, res){
    //get all DB
    var dbList = utils.getAllPaintingDBList();
    var data = {'dbList' : dbList};

    //response
    utils.sendResponse(res, 200, JSON.stringify(data));
});

// post getAllPortrait API
app.post('/getAllPortrait', function(req, res){
    //get all portrait
    var portraitList = utils.getPaintingDBListByName("./db/" + config.default_db);
    var data = {'portraitList' : portraitList};

    //response
    utils.sendResponse(res, 200, JSON.stringify(data));
});
