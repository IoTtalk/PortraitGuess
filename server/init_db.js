var fs = require('fs'),
    db = require('./db').db,
    utils = require("./utils");

function create_db(){
    //db has already existed
    if(fs.existsSync("./portraitguess.sqlite")){
        console.log("--- db has already existed ---");
        return false;
    }

    db.Picture.sync({force: false}).then(function(){});
    db.GroupMember.sync({force: false}).then(function(){});
    db.Question.sync({force: false}).then(function(){});
    db.Group.sync({force: false}).then(function(){});
    db.Class.sync({force: false}).then(function(){});
}

function set_db_init_value(){
    //create default class value
    var default_portrait_folder_path = '/Users/jerry/Git/FrameDA/IDA_painting/data/portrait/',
        default_class = [{
            name : "人物" ,
            sample_name : "伊麗莎白一世,Elizabeth I",
            description : "出生-死亡\nex: 1961-1988"
        }],
        default_group = [
            { status : 1 , ClassId : 1, name : "科學家" }, //1
            { status : 1 , ClassId : 1, name : "作家" },
            { status : 1 , ClassId : 1, name : "音樂家" },
            { status : 1 , ClassId : 1, name : "畫家" },
            { status : 1 , ClassId : 1, name : "政治家" },
            { status : 1 , ClassId : 1, name : "演員" }, //6
            { status : 1 , ClassId : 1, name : "實業家" },
            { status : 1 , ClassId : 1, name : "電子遊戲設計師" },
            { status : 1 , ClassId : 1, name : "軍人" },
            { status : 1 , ClassId : 1, name : "企業家" },
            { status : 1 , ClassId : 1, name : "魔術師" }, //11
            { status : 1 , ClassId : 1, name : "數學家" },
            { status : 1 , ClassId : 1, name : "物理學家" },
            { status : 1 , ClassId : 1, name : "天文學家" },
            { status : 1 , ClassId : 1, name : "船長" },
            { status : 1 , ClassId : 1, name : "皇室" }, //16
            { status : 1 , ClassId : 1, name : "探險家" },
            { status : 1 , ClassId : 1, name : "歌手" },
            { status : 1 , ClassId : 1, name : "藝術家" },
            { status : 1 , ClassId : 1, name : "宗教家" },
            { status : 1 , ClassId : 1, name : "經濟學家" }, //21
            { status : 1 , ClassId : 1, name : "英雄" },
            { status : 1 , ClassId : 1, name : "服裝設計師" },
            { status : 1 , ClassId : 1, name : "虛擬角色" },
            { status : 1 , ClassId : 1, name : "賽車手" },
            { status : 1 , ClassId : 1, name : "發明家" }, //26
            { status : 1 , ClassId : 1, name : "教育家" }
        ],
        default_human_question = [
            { group: [6], dirname: "三船敏郎,Toshiro Mifune,1920-1997"},
            { group: [7], dirname: "久原房之助,Fusanosuke Kuhara,1869-1965"},
            { group: [8], dirname: "山內博,Hiroshi Yamauchi,1927-2013"},
            { group: [9], dirname: "山本五十六,Isoroku Yamamoto,1884-1943"},
            { group: [10], dirname: "尹衍樑,Samuel Yin,1950-"},
            { group: [3], dirname: "巴哈,Bach,1685-1750"},
            { group: [11], dirname: "巴格拉斯,David Berglas,1926-"},
            { group: [9], dirname: "文森,Strong Vincent,1837-1863"},
            { group: [1,12,13,14], dirname: "牛頓,Newton,1643-1727"},
            { group: [10], dirname: "卡內基,Andrew Carnegie,1835-1919"},
            { group: [9], dirname: "卡尼,Stephen Watts Kearny,1794-1848"},
            { group: [2], dirname: "史托夫人,Harriet Beecher Stowe,1811-1896"},
            { group: [9], dirname: "史考特,Winfield Scott,1786-1866"},
            { group: [15], dirname: "史密斯船長,John Smith,1580-1631"},
            { group: [5], dirname: "史達林,Joseph Stalin,1878-1953"},
            { group: [16], dirname: "尼古拉二世,Nicholas II,1868-1918"},
            { group: [17], dirname: "布蘭,Rebecca Bryan,1739-1813"},
            { group: [18], dirname: "平原綾香,Ayaka Hirahara,1984-"},
            { group: [19, 20], dirname: "弘一法師,Hong Yi,1880-1942"},
            { group: [12,13,14], dirname: "白努利,Daniel Bernoulli,1700-1782"},
            { group: [21], dirname: "矢內原忠雄,Tadao Yanaihara,1893-1961"},
            { group: [16], dirname: "伊麗莎白一世,Elizabeth I,1533-1603"},
            { group: [5,9], dirname: "休斯頓,Samuel Houston,1793-1863"},
            { group: [9], dirname: "多恩,Gustavus Cheyney Doane,1840-1892"},
            { group: [5], dirname: "多莉,Dolley Payne Todd Madison,1768-1849"},
            { group: [2,6,18], dirname: "安德魯斯,Julie Andrews,1935-"},
            { group: [2], dirname: "托爾斯泰,Leo Tolstoy,1828-1910"},
            { group: [5,9], dirname: "艾森豪,Dwight David Eisenhower,1890-1969"},
            { group: [5], dirname: "艾碧蓋爾,Abigail Adams,1744-1818"},
            { group: [22], dirname: "西科德,Statue of Laura Secord,1775-1868"},
            { group: [1,12,14], dirname: "克卜勒,Johannes Kepler,1571-1630"},
            { group: [5], dirname: "克萊,Henry Clay,1777-1852"},
            { group: [3], dirname: "貝多芬,Beethoven,1770-1827"},
            { group: [7], dirname: "里維爾,Paul Revere,1734-1818"},
            { group: [5], dirname: "亞當斯,John Adams,1735-1826"},
            { group: [5], dirname: "亞當斯,Samuel Adams,1722-1803"},
            { group: [16], dirname: "亞歷山大二世,Alexander II,1818-1881"},
            { group: [1], dirname: "孟德爾,Gregor Johann Mendel,1822-1884"},
            { group: [6], dirname: "帕克,Fess Parker,1924-2010"},
            { group: [5], dirname: "拉許,Benjamin Rush,1745-1813"},
            { group: [5], dirname: "林肯,Abraham Lincoln,1809-1865"},
            { group: [16], dirname: "波卡康塔斯,Pocahontas,1596-1617"},
            { group: [5], dirname: "波爾克,James Knox Polk,1795-1849"},
            { group: [6], dirname: "芭芭拉史坦威,Barbara Stanwyck,1907-1990"},
            { group: [9], dirname: "約克,Alvin Cullum York,1887-1964"},
            { group: [3], dirname: "約翰史特勞斯,Johann Strauss II,1825-1899"},
            { group: [2], dirname: "韋伯斯特,Noah Webster,1758-1843"},
            { group: [23], dirname: "香奈兒,Gabrielle Coco Chanel,1883-1971"},
            { group: [5], dirname: "孫中山,Sun Yat-Sen,1866-1925"},
            { group: [2], dirname: "庫柏,James Fenimore Cooper,1789-1851"},
            { group: [3], dirname: "柴可夫斯基,Tchaikovsky,1840-1893"},
            { group: [9], dirname: "格羅夫斯,Leslie Richard Groves,1896-1970"},
            { group: [5,9], dirname: "格蘭特,Hiram Ulysses Grant,1822-1885"},
            { group: [5,9], dirname: "泰勒,Zachary Taylor,1784-1850"},
            { group: [2], dirname: "海爾,Sarah Josepha Buell Hale,1788-1879"},
            { group: [9], dirname: "特拉維斯,William Travis,1809-1836"},
            { group: [24], dirname: "神力女超人,Wonder Woman,1941-"},
            { group: [2], dirname: "馬克吐溫,Samuel Langhorne Clemens,1835-1910"},
            { group: [5], dirname: "馬歇爾,John Marshall,1755-1835"},
            { group: [5], dirname: "曼德拉,Nelson Mandela,1918-2013"},
            { group: [9], dirname: "梅爾加,Agustín Melgar,1829-1847"},
            { group: [4], dirname: "莫內,Claude Monet,1840-1926"},
            { group: [9], dirname: "雪曼,William Tecumseh Sherman,1820-1891"},
            { group: [5], dirname: "麥金利,William McKinley,1843-1901"},
            { group: [5], dirname: "麥迪遜,James Madison,1751-1836"},
            { group: [5], dirname: "傑克森,Andrew Jackson,1767-1845"},
            { group: [26], dirname: "惠特尼,Eli Whitney,1765-1825"},
            { group: [2], dirname: "惠特曼,Walt Whitman,1819-1892"},
            { group: [6], dirname: "湯姆克魯斯,Tom Cruise,1962-"},
            { group: [5], dirname: "華盛頓,George Washington,1732-1799"},
            { group: [9], dirname: "奧卡,Fernando Montes de Oca,1829-1847"},
            { group: [1,13], dirname: "奧本海默,Julius Robert Oppenheimer,1904-1967"},
            { group: [6], dirname: "奧黛麗赫本,Audrey Hepburn,1929-1993"},
            { group: [1,13], dirname: "愛因斯坦,Albert Einstein,1879-1955"},
            { group: [1,10,26], dirname: "愛迪生,Thomas Alva Edison,1847-1931"},
            { group: [9], dirname: "愛斯庫提亞,Juan Escutia,1827-1847"},
            { group: [5], dirname: "賈桂琳,Jackie Kennedy,1929-1994"},
            { group: [1,3,4,12,13,14,19], dirname: "達文西,da Vinci,1452-1519"},
            { group: [4], dirname: "雷諾瓦,Renoir,1841-1919"},
            { group: [5], dirname: "漢考克,John Hancock,1737-1793"},
            { group: [6], dirname: "瑪麗蓮夢露,Marilyn Monroe,1926-1962"},
            { group: [3], dirname: "福斯特,Stephen Collins Foster,1826-1864"},
            { group: [2,5], dirname: "潘恩,Thomas Paine,1737-1809"},
            { group: [5,27], dirname: "霍瑞斯曼,Horace Mann,1796-1859"},
            { group: [17,22], dirname: "鮑伊,James Bowie,1796-1836"},
            { group: [5,9], dirname: "戴高樂,Charles André Joseph Marie de Gaulle,1890-1970"},
            { group: [6], dirname: "戴維斯,Marion Davies,1897-1961"},
            { group: [24], dirname: "寶嘉康蒂,Pocahontas,1596-1617"},
            { group: [9], dirname: "蘇亞雷斯,Vicente Suarez,1833-1847"},
            { group: [5,7,17], dirname: "蘭福德,Nathaniel Pitt Langford,1832-1911"}
        ];

    db.Class.bulkCreate(default_class).then(function(){
        console.log("--- set db default [class] value done ---");
        db.Group.bulkCreate(default_group).then(function(){
            console.log("--- set db default [group] value done ---");
            var count = 0;
            default_human_question.forEach((human_question) => {
                var question_id = utils.uuid().substring(0,16);
                var group = [];
                for(var i in human_question.group){
                    group.push({ QuestionId: question_id, GroupId: human_question.group[i]});
                }

                var dirname = default_portrait_folder_path + human_question.dirname,
                    pictures = [];
                fs.readdirSync(dirname).forEach(pic_file => {
                    var pic_name = utils.uuid().substring(0,16) + ".jpg";
                    pictures.push({
                        id: pic_name,
                        order: pic_file.split(".")[0],
                        origin_name: pic_file,
                        QuestionId: question_id
                    });
                    
                    var oldpath = dirname + "/" + pic_file,
                        newpath = "../web/img/" + pic_name;
                    fs.copyFile(oldpath, newpath, (err) => {
                        if (err) console.log(err);
                    });
                });
                
                var name = human_question.dirname.split(",")[0] + ", " + human_question.dirname.split(",")[1],
                    description = human_question.dirname.split(",")[2];
                var data = {
                    id : question_id,
                    name : name,
                    description : description,
                    status : 1,
                    ClassId: 1,
                    GroupMembers : group,
                    Pictures : pictures
                };
                db.Question.create(data, {include: [db.GroupMember, db.Picture]}).then(function(){
                    console.log(name, " created");
                    count += 1;
                    if(count == default_human_question.length){
                        console.log("--- set db default [human_question] value done ---");
                    }
                });
            });
        });
    });
}

//main
create_db();
set_db_init_value();