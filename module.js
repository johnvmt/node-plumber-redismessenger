module.exports = function(config) {
	return new RedisMessenger(config);
};

var redis = require("redis");

function RedisMessenger(config) {

	this.pubClient = this.createClient(config, function(error, response) {
		if(error)
			console.log("pub create error");
		else
			console.log("pub create success");
	});

	this.subClient = this.createClient(config, function(error, response) {
		if(error)
			console.log("pub create error");
		else
			console.log("pub create success");
	});
}


RedisMessenger.prototype.pub = function(params, callback) {


};

RedisMessenger.prototype.createClient = function(config, callback) {
	var client = redis.createClient(config.port, config.host, {});
	client.auth(config.password, function(error, response) {
		if (error)
			callback(error, null);
		else
			callback(null, true);
	});
};
