var Sequelize = require('sequelize'),
    sequelize = new Sequelize('questionaire', null, null, {
        define: {
            charset: 'utf8',
            dialectOptions: {
                collate: 'utf8_general_ci'
            }
        },
        logging: false,
        host: 'localhost',
        dialect: 'sqlite',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        // SQLite only
        storage: './portraitguess.sqlite',
        // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
        operatorsAliases: false
    });

const Class = sequelize.define('Class', {
    name: {
        type: Sequelize.STRING
        // unique: true
    },
    sample_name: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.STRING
    }
});

const Question = sequelize.define('Question', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.INTEGER
    }
});

const Picture = sequelize.define('Picture', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    order: {
        type: Sequelize.INTEGER
    },
    origin_name: {
        type: Sequelize.STRING
    }
});

const Group = sequelize.define('Group', {
    name: {
        type: Sequelize.STRING
        // unique: true
    },
    status: {
        type: Sequelize.INTEGER
    }
});

const GroupMember = sequelize.define('GroupMember', {
    
});

// Class.id <-> Question.ClassId
Class.hasMany(Question);
Question.belongsTo(Class);

// Class.id <-> Group.ClassId
Class.hasMany(Group);
Group.belongsTo(Class);

// Group.id <-> GroupMember.GroupId
Group.hasMany(GroupMember);
GroupMember.belongsTo(Group, {onDelete: 'cascade', hooks:true});

// Question.id <-> Picture.QuestionId
Question.hasMany(Picture);
Picture.belongsTo(Question, {onDelete: 'cascade', hooks:true});

// Question.id <-> GroupMember.QuestionId
Question.hasMany(GroupMember);
GroupMember.belongsTo(Question, {onDelete: 'cascade', hooks:true});

var db = {
    orm: sequelize,
    Class: Class,
    Question: Question,
    GroupMember: GroupMember,
    Group: Group,
    Picture: Picture
};

exports.db = db;
