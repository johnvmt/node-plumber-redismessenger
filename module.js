module.exports = function(config) {
	return new RedisMessenger(config);
};

var redis = require("redis");

function RedisMessenger(config) {
	var self = this;

	self.publishQueue = [];
	self.subscribeQueue = [];

	self.pubLoaded = false;
	self.pubClient = self.createClient(config, function(error, response) {
		if(error)
			console.log("pub create error");
		else {
			self.pubLoaded = true;
			while(self.publishQueue.length > 0) {
				var queueItem = self.publishQueue.shift();
				self.publish(queueItem.channel, queueItem.message, queueItem.callback);
			}
			delete self.publishQueue;
			console.log("pub create success");
		}
	});

	self.subCallbacks = {};

	self.subLoaded = false;
	self.subClient = self.createClient(config, function(error, response) {
		if(error)
			console.log("sub create error");
		else {
			self.subLoaded = true;
			while(self.subscribeQueue.length > 0) {
				var queueItem = self.subscribeQueue.shift();
				self.subscribe(queueItem.channel, queueItem.subCallback, queueItem.callback);
			}
			delete self.subscribeQueue;
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
		console.log(this);
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
	return client;
};
