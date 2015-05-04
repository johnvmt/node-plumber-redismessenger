module.exports = function(plumber, config) {
	return new RedisMessenger(plumber, config);
};

var redis = require("redis");

function RedisMessenger(plumber, config) {
	var self = this;
	self.plumber = plumber;

	self.messageCallbacks = {};
	self.channelCallbacks = {};

	if(typeof config.prefix != "string")
		self.prefix = "";
	else
		self.prefix = config.prefix;

	self.pubClient = self._createClient(config.auth, function(error, response) {
		if(error)
			console.error("pub create error");
		else
			console.log("pub create success");
	});

	self.subClient = self._createClient(config.auth, function(error, response) {
		if(error)
			console.error("sub create error");
		else
			console.log("sub create success");
	});

	self.subClient.on("subscribe", function (channel) {
		if(typeof self.channelCallbacks[channel] === "function") {
			self.channelCallbacks[channel](null, true);
		}
	});

	self.subClient.on("message", function (channel, jsonMessage) {
		if(typeof self.messageCallbacks[channel] === "function") {
			try {
				var message = JSON.parse(jsonMessage);
				self.messageCallbacks[channel](message.body, message);
			}
			catch(error) {
				console.error("Message could not be parsed");
			}
		}
	});
}

RedisMessenger.prototype.publish = function(channel, body, callback) {
	var self = this;
	self.plumber.infrastructure.platform.instanceId(function(error, instanceId) {
		if(error)
			callback(error, null);
		else {
			var jsonMessage = JSON.stringify({
				body: body,
				instanceId: instanceId,
				time: new Date()
			});
			self.pubClient.publish(self.prefix + channel, jsonMessage);
			console.log("SENDING", jsonMessage);
			if (typeof callback === "function")
				callback(null, true);
		}
	});
};

RedisMessenger.prototype.subscribe = function(channel, messageCallback, subscribeCallback) {
	var self = this;
	self.messageCallbacks[self.prefix + channel] = messageCallback; // handle incoming messages on this channel
	if(typeof subscribeCallback === "function")
		self.channelCallbacks[self.prefix + channel] = subscribeCallback; // triggered when subscription becomes active
	self.subClient.subscribe(self.prefix + channel);
};

RedisMessenger.prototype.unsubscribe = function(channel, callback) {
	// TODO test this
	this.subClient.unsubscribe(channel);
	callback(null, true);
};

RedisMessenger.prototype._createClient = function(config, callback) {
	var client = redis.createClient(config.port, config.host, {});
	client.auth(config.password, function(error, response) {
		if (error)
			callback(error, null);
		else
			callback(null, true);
	});
	return client;
};
