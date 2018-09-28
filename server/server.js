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
    utils = require("./utils");

/*** upload ***/
var uploadFolder = './upload_cache/';
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
                ws2Painting.send("leaveGame");
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
                ws2Painting.send("enterGame");
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
            ws2Painting.send(msg);
            // dai.push("Name_I", [msg]);
            console.log("Name-I");
        });

        socket.on("Correct", function(msg){
            ws2Painting.send("Correct");
            // dai.push("Correct", [1]);
            console.log("Correct");
        });
        
        socket.on("Wrong", function(msg){
            ws2Painting.send("Wrong");
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
utils.createPaintingDB("./db/" + config.painting_db, nameList);



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
        req.originalUrl.substr(1) != "upload" && 
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
    else if(req.originalUrl.substr(1) == "upload"){
        fs.readFile("../web/html/upload.html", function (err, contents) {
            if (err){
                console.log(err);
            }
            else{
                contents = contents.toString('utf8');
                utils.sendResponse(res, 200, contents);
            }
        });
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
                var allList = utils.getPaintingDBListByName("./db/" + config.painting_db);

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
app.post('/upload', upload.array('images'), function (req, res) {
    var files = req.files;
    var saveDir = config.paintingPath + '/' + req.body.dirName;
    console.log(req.body.dirName);
    console.log(saveDir);
    utils.createFolder(saveDir);
    files.sort(function(a, b){
        return utils.alphanum(a.originalname, b.originalname);
    });                     
    console.log(files);
    for(var i = 0,j = 1; i < files.length; i++){
        if(files[i].mimetype != 'image/jpeg'){
            continue;
        }
        mv(files[i].path, saveDir + '/' + j+".jpg", function(err) {
            if(err)
                res.end(err);
        });     
        j++;
    }
    res.end('File uploaded!');
})

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
