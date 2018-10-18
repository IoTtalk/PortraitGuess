var fs = require('fs'),
    ejs = require('ejs'),
    config = require('./config');

var alphanum = function(a, b){
    function chunkify(t){
        var tz = [], x = 0, y = -1, n = 0, i, j;
        while (i = (j = t.charAt(x++)).charCodeAt(0)){
            var m = (i == 46 || (i >=48 && i <= 57));
            if(m !== n){
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
            }
            else{
                return (aa[x] > bb[x]) ? 1 : -1;
            }
        }
    }
    return aa.length - bb.length;
}

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

var getPaintingDBListByName = function(painting_db){
    var portraitList = [];
    fs.readFileSync(painting_db).toString().split(/\n/).forEach(function(line){
        if(line == "\n" || line == " " || line == "")
            return;
        //console.log("-", line, "-");
        portraitList.push(line);
    });
    return portraitList;
}

var getPaintingDBListByPath = function(paintingPath){
    var dirNameList = [];
    fs.readdirSync(paintingPath).forEach(function(dirName){
        if(dirName == ".DS_Store") //filter macOS dirty file
            return;
        dirNameList.push(dirName);
    });
    return dirNameList;
}

var createPaintingDB = function(dbName, portraitList){
    fs.writeFileSync(dbName, "");
    portraitList.forEach((protraitName) => {
        fs.appendFileSync(dbName, protraitName + "\n");
    });
}

var getAllPaintingDBList = function(){
    var DBList = [],
        tmp;
    fs.readdirSync("./db/").forEach(function(filename){
        if(filename == ".DS_Store") //filter macOS dirty file
            return;
        tmp = filename.split('.');
        if(tmp.length > 1 && tmp[1] == "txt"){
            DBList.push(tmp[0]);
        }
    });
    return DBList
}

var addPortraitToPaintingDB = function(dbname, portraitname){
    fs.appendFile(dbname, portraitname + "\n", function (err) {
        if(err) return console.log(err);
        console.log('successfully appended "' + portraitname + '" in "' + dbname + '"');
    });
}

module.exports = {
    alphanum: alphanum,
    createFolder: createFolder,
    sendResponse: sendResponse,
    sendEjsRenderResponse: sendEjsRenderResponse,
    getPaintingDBListByName: getPaintingDBListByName,
    getPaintingDBListByPath: getPaintingDBListByPath,
    createPaintingDB: createPaintingDB,
    getAllPaintingDBList: getAllPaintingDBList,
    addPortraitToPaintingDB: addPortraitToPaintingDB,
};


