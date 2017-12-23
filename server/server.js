/**
 * Created by kuan on 2017/5/21.
 */
var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    fs = require('fs'),
    ejs = require('ejs'),
    shortid = require('shortid'),
    ws = require("nodejs-websocket"),
    config = require('./config'),
    bodyParser = require('body-parser'),
	multer  = require('multer'),
	mv = require('mv');

/*** upload ***/
var uploadFolder = './upload_cache/';
var createFolder = function(folder){
	try{
		fs.accessSync(folder); 
		return false; // exist
	}catch(e){
		fs.mkdirSync(folder);
		return true; // does not exist 
	}
};
function alphanum(a, b) {
  function chunkify(t) {
    var tz = [], x = 0, y = -1, n = 0, i, j;
    while (i = (j = t.charAt(x++)).charCodeAt(0)) {
      var m = (i == 46 || (i >=48 && i <= 57));
      if (m !== n) {
        tz[++y] = "";
        n = m;
      }
      tz[y] += j;
    }
    return tz;
  }

  var aa = chunkify(a);
  var bb = chunkify(b);

  for (x = 0; aa[x] && bb[x]; x++) {
    if (aa[x] !== bb[x]) {
      var c = Number(aa[x]), d = Number(bb[x]);
      if (c == aa[x] && d == bb[x]) {
        return c - d;
      } else return (aa[x] > bb[x]) ? 1 : -1;
    }
  }
  return aa.length - bb.length;
}
createFolder(uploadFolder);
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadFolder);
	},
	/*filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now());  
 	}*/
});
var upload = multer({ storage: storage });
/******/

var nameList = [];
var url = shortid.generate();
console.log(url);
//create painting_db.txt.
fs.writeFileSync(config.painting_db,"");
fs.readdirSync(config.patingPath).forEach(function(fileName){
	if(fileName == ".DS_Store") //filter macOS dirty file
		return;
    console.log(fileName);
    fs.appendFileSync(config.painting_db, fileName+"\n");
    nameList.push(fileName);
});



//static files
app.use(express.static("../web"));

app.use(bodyParser.urlencoded({
    extended: true,
}));

// process http body
app.use(bodyParser.json());

// start server
server.listen((process.env.PORT || config.webServerPort), '0.0.0.0');


// authentication url API
app.post("/url",function(req, res){
    if(req.body.accessToken === config.accessToken){
    	url = shortid.generate();
    	console.log(url);
        var fullUrl = req.protocol + '://' + req.get('host') + '/' + url;
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(fullUrl);
    }
    else{
        res.writeHead(403, {"Content-Type": "text/html"});
        res.end("permission denied");
    }
});

// get index API
app.get("/*", function (req, res) {
    if(req.originalUrl.substr(1) != url && req.originalUrl.substr(1) != "upload" && 
    	req.originalUrl.substr(1) != "endPage"){
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end("url not found");
		return;
    }
	else if(req.originalUrl.substr(1) == "upload"){
		fs.readFile("../web/html/upload.html", function (err, contents) {
			if (err){
				console.log(err);
			}
			else{
				contents = contents.toString('utf8');
				res.writeHead(200, {"Content-Type": "text/html"});
				res.end(contents);
			}
		});
	}
	else if(req.originalUrl.substr(1) == "endPage"){
		fs.readFile("../web/html/endPage.html", function (err, contents) {
			if (err){
				console.log(err);
			}
			else{
				contents = contents.toString('utf8');
				res.writeHead(200, {"Content-Type": "text/html"});
				res.end(contents);
			}
		});
	}
	else{
		fs.readFile("../web/html/index.html", function (err, contents) {
			if (err){
				console.log(err);
			}
			else{
				contents = contents.toString('utf8');
				res.writeHead(200, {"Content-Type": "text/html"});
				res.end(ejs.render(contents, 
				{
					nameList: nameList, 
					iotTalkIP: config.iotTalkIP, 
					webSocketPort: config.webSocketPort, 
					webServerPort: config.webServerPort,
					paintingIP: config.paintingIP
				}));
			}
		});
	}
});

// post images API
app.post('/upload', upload.array('images'),function (req, res) {
	var files = req.files;
	var saveDir = config.patingPath + '/' + req.body.dirName;
	console.log(req.body.dirName);
	createFolder(saveDir)
	files.sort(function(a, b){
		return alphanum(a.originalname, b.originalname);
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




