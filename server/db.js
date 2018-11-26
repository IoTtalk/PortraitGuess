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
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    }
});

const Category = sequelize.define('Category', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    }
});

const Question = sequelize.define('Question', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    status: {
        type: Sequelize.INTEGER
    }
});

const QuestionCategory = sequelize.define('QuestionCategory', {
    category_id: {
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

const Human = sequelize.define('Human', {
    chi_name: {
        type: Sequelize.STRING
    },
    eng_name: {
        type: Sequelize.STRING
    },
    birth_year: {
        type: Sequelize.INTEGER
    },
    death_year: {
        type: Sequelize.INTEGER
    }
});

const Group = sequelize.define('Group', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.INTEGER
    }
});

const GroupMember = sequelize.define('GroupMember', {
    question_id: {
        type: Sequelize.STRING
    }
});

Question.hasMany(QuestionCategory);
Question.hasMany(Picture);
Question.hasOne(Human);
Group.hasMany(GroupMember);
Question.belongsTo(Class);
Category.belongsTo(Class);

var db = {
    orm: sequelize,
    Class: Class,
    Category: Category,
    Question: Question,
    QuestionCategory: QuestionCategory,
    Human: Human,
    GroupMember: GroupMember,
    Group: Group,
    Picture: Picture
};

exports.db = db;
