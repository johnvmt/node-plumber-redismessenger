module.exports = function(config) {
	return new RedisMessenger(config);
};

function RedisMessenger(config) {
	console.log("TEST");

}

RedisMessenger.prototype.pub = function(params, callback) {


};
