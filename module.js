module.exports = function(config) {
	return new RedisMessenger(config);
};

var redis = require("redis");

function RedisMessenger(config) {

	this.client = redis.createClient(config.port, config.host, {});
	this.client.auth(config.password, function(error, response) {
		console.log("err", error);
		console.log("response", response);
		/* client.set("foo_rand000000000000", "OK");

		// This will return a JavaScript String
		client.get("foo_rand000000000000", function (err, reply) {
			console.log(reply.toString()); // Will print `OK`
		}); */
	});



}

RedisMessenger.prototype.pub = function(params, callback) {


};
