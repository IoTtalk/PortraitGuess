var fs = require('fs'),
    db = require('./db').db;

function create_db(){
    db.Picture.sync({force: false}).then(function(){});
    db.GroupMember.sync({force: false}).then(function(){});
    db.QuestionCategory.sync({force: false}).then(function(){});
    // db.Human.sync({force: false}).then(function(){});
    db.Class.sync({force: false}).then(function(){});
    db.Category.sync({force: false}).then(function(){});
    db.Question.sync({force: false}).then(function(){});
    db.Group.sync({force: false}).then(function(){});
}

function set_db_init_value(){
    //db has already existed
    if(fs.existsSync("./portraitguess.sqlite")){
        console.log("--- db has already existed ---");
        return false;
    }

    
    //create default class value
    var human_classid,
        default_class = [
            {
                name : "人物" ,
                sample_name : "伊麗莎白一世,Elizabeth I",
                description : "(出生,死亡) (1961,1988)"
            }
        ];

    db.Class.bulkCreate(default_class).then(function() {
        console.log("--- set db default value start ---");
        return db.Class.findAll();
    }).then(function(ClassList) {
        ClassList.forEach((ClassSetItem) => {
            var ClassData = ClassSetItem.get({ plain: true });
            console.log(ClassData);
            if(ClassData.name == "人物"){
                var default_human_category = [
                    { ClassId : ClassData.id, name : "科學家" },
                    { ClassId : ClassData.id, name : "作家" },
                    { ClassId : ClassData.id, name : "音樂家" },
                    { ClassId : ClassData.id, name : "畫家" },
                    { ClassId : ClassData.id, name : "政治家" },
                    { ClassId : ClassData.id, name : "演員" },
                ];
                db.Category.bulkCreate(default_human_category).then(function() {
                    return db.Category.findAll();
                }).then(function(CategoryList) {
                    CategoryList.forEach((CategorySetItem) => {
                        console.log(CategorySetItem.get({ plain: true }));
                    });
                    console.log("--- set db default value done ---");
                });
            }
        });
    });
}

//main
create_db();
set_db_init_value();