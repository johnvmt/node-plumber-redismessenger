module.exports = function(config) {
	return new RedisMessenger(config);
};

function RedisMessenger(config) {
	console.log(config);

}

RedisMessenger.prototype.pub = function(params, callback) {


};
