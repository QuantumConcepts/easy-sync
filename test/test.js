var assert = require("assert");
var sync = require("../index");

describe("sync", function () {
	it("should run with no timeline", function (done) {
		sync(null, done);
	});
	
	it("should run with no callback", function (done) {
		sync(null, null);
		done();
	});
	
	it("should run a single action", function (done) {
		var expected = [1];
		var actual = [];
		var timeline = makeWork(actual, 1);
		
		sync(timeline, function () {
			assert.deepEqual(actual, expected);
			done();
		});
	});
	
	it("can run with nested syncs", function (done) {
		var expected = [1,2,3,4];
		var actual = [];
		var timeline = [
			function (cb) { actual.push(1); cb(); },
			sync.p([
				function (cb) { setTimeout(function (cb) { actual.push(3); cb() }, 300, cb); },
				function (cb) { actual.push(2); cb(); }]),
			function (cb) { actual.push(4); cb(); }];
		
		sync(timeline, function () {
			assert.deepEqual(actual, expected);
			done();
		});
	});
	
	it("should run flat actions", function (done) {
		var expected = [1,2,3];
		var actual = [];
		var timeline = [
			makeWork(actual, 1),
			makeWork(actual, 2),
			makeWork(actual, 3)];
		
		sync(timeline, function () {
			assert.deepEqual(actual, expected);
			done();
		});
	});
	
	it("should run nested actions", function (done) {
		var expected = [1,2,2,2,3];
		var actual = [];
		var timeline = [
			makeWork(actual, 1), [
				makeWork(actual, 2),
				makeWork(actual, 2),
				makeWork(actual, 2)],
			makeWork(actual, 3)];
		
		sync(timeline, function () {
			assert.deepEqual(actual, expected);
			done();
		});
	});
	
	it("should run deeply nested actions", function (done) {
		var expected = [1,2,2,3,4,4,5,4,6,6,7,8,8,9];
		var actual = [];
		var timeline = [
			makeWork(actual, 1), [
				makeWork(actual, 2),
				makeWork(actual, 2), [
					makeWork(actual, 3), [
					makeWork(actual, 4),
					makeWork(actual, 4),[
						makeWork(actual, 5)],
					makeWork(actual, 4)],
				makeWork(actual, 6),
				makeWork(actual, 6), [
					makeWork(actual, 7), [
						makeWork(actual, 8),
						makeWork(actual, 8)]]],
			makeWork(actual, 9)]];
		
		sync(timeline, function () {
			assert.deepEqual(actual, expected);
			done();
		});
	});
	
	it("should not try to do work on non-functions and non-arrays", function (done) {
		var expected = [1];
		var actual = [];
		var timeline = [
			makeWork(actual, 1),
			"Don't run me!"];
		
		// Passing a null callback since it will never be called anyway.
		sync(timeline, null, function (err){
			assert(err != null);
			assert(err.indexOf("didn't expect type") >= 0);
			done();
		});
	});
	
	it("should handle exceptions gracefully", function (done) {
		var errorMessage = "Handle with care.";
		
		sync(function () {
			throw new Error(errorMessage);
		}, null, function (err) {
			assert(err != null);
			assert(err.message != null);
			assert.equal(err.message, errorMessage);
			done();
		});
	});
	
	it("should abort upon error", function (done) {
		var timeline = [
			function () { throw new Error("I am error."); },
			function () { assert.fail(); }];
		
		sync(timeline, function () {
			done();
		}, function () {
			done();
		});
	});
	
	it("should not execute callback after error", function (done) {
		var timeline = function () { throw new Error("I am error."); };
		
		sync(timeline, function () {
			assert.fail();
			done();
		}, function () {
			done();
		});
	});
});

function makeWork(actual, result) {
	return function (cb, err) {
		doWork(actual, result);
		cb(err);
	};
}

function doWork(actual, result) {
	actual.push(result);
}