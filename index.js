function sync(timeline, callback, errorCallback) {
    var isNull = (timeline == null);
    var isArray = Array.isArray(timeline);
    var isFunction = (typeof timeline === "function");

    if (isArray) {
		var first = timeline[0];
		var next = (timeline.length == 0 ? null : timeline.slice(1));
		var nextCallback = sync.bind(this, next, callback, errorCallback);
		
		sync(first, nextCallback, errorCallback);
    }
    else if (isFunction) {
        try {
			timeline(callback);
		} catch (err) {
			if (errorCallback)
				errorCallback(err);
			else
				throw err;
		}
	}
    else if (!isNull) {
		var message = "Only arrays and functions may be included in the timeline, didn't expect type \"" + typeof timeline + "\": " + JSON.stringify(timeline);
		
		if (errorCallback)
			errorCallback(message);
		else
			throw new Error(message);
	}
    else if (callback)
        callback();
}

sync.sync = sync;
sync.s = sync.sync;
sync.parallel = function (timeline) {
	return function (callback) {
		var total = timeline.length;
		var current = 0;
		var syncCallback = function () {
			current++;
			
			if (total == current)
				callback();
		};
		
		for (var i = 0; i < timeline.length; i++)
			timeline[i](syncCallback);
	};
};
sync.p = sync.parallel;

module.exports = sync;