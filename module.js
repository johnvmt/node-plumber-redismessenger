module.exports = function(config) {
	return new RedisMessenger(config);
};

var redis = require("redis");

function RedisMessenger(config) {

	this.publishQueue = [];
	this.subscribeQueue = [];

	this.pubLoaded = false;
	this.pubClient = this.createClient(config, function(error, response) {
		if(error)
			console.log("pub create error");
		else {
			this.pubLoaded = true;
			while(this.publishQueue.length > 0) {
				var queueItem = this.publishQueue.shift();
				this.publish(queueItem.channel, queueItem.message, queueItem.callback);
			}
			delete this.publishQueue;
			console.log("pub create success");
		}
	});

	this.subCallbacks = {};

	this.subLoaded = false;
	this.subClient = this.createClient(config, function(error, response) {
		if(error)
			console.log("sub create error");
		else {
			this.subLoaded = true;
			while(this.subscribeQueue.length > 0) {
				var queueItem = this.subscribeQueue.shift();
				this.subscribe(queueItem.channel, queueItem.subCallback, queueItem.callback);
			}
			delete this.publishQueue;
			console.log("sub create success");
		}
	});
}

RedisMessenger.prototype.publish = function(channel, message, callback) {
	if(this.pubLoaded) {
		console.log("Publishing");
		this.pubClient.publish(channel, message);
		callback(null, true);
	}
	else
		this.publishQueue.push({channel: channel, message: message, callback: callback});
};

RedisMessenger.prototype.subscribe = function(channel, subCallback, callback) {
	if(this.subLoaded) {
		this.subClient.subscribe(channel);
		this.subCallbacks[channel] = subCallback;
		var subCallbacks = this.subCallbacks;
		this.subClient.on("message", function(channel, message) {
			if(typeof subCallbacks[channel] === "function")
				subCallbacks[channel](message);
		});
		callback(null, true);
	}
	else
		this.subscribeQueue.push({channel: channel, subCallback: subCallback, callback: callback});
};

RedisMessenger.prototype.unsubscribe = function(channel, callback) {

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
