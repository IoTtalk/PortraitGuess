var dan = require("./dan").dan(),
	config = require("./config");

var dai = function(){
	var register = function(){
		dan.init(pull, config.IotTalkIP, config.macAddr, {
			'dm_name': 'Riddle',
		    'd_name' : '1.Riddle',
		    'u_name': 'yb',
		    'is_sim': false,
		    'df_list': ["Name-I", "Correct", "Wrong"]
		}, function(result){
			console.log('register:', result);
		});
	};
	var deregister = function(){
        dan.deregister();
    };
    var push = function(featrue, data){
    	dan.push(featrue, data);
    };
    return {
        'register': register,
        'deregister': deregister,
        'push': push
    }
}();

exports.dai = dai;




