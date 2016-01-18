# Easy Sync for Node.JS
A simple yet flexible synchronization utility.

## What's it do?
Allows you to easily run parallel and sequential actions, however you want to run them.

## Why's it needed?
It may not be. But if you need to do what this does, then you may need it. If you are running some asynchronous processes which need to "wait" for other asynchronous processes to complete, this will help you accomplish such a feat.

## How's it work?
You define a `timeline` and a `callback` and send them to `sync` which will run your timeline as you've described it and then execute the callback when the timeline has been completed.

## How do I use it?
It's very straightforward.

    void sync([timeline, callback, errorCallback]);

*Parameters*

`timeline` (optional) is either a function or an array. If it's an array, the elements of that array can be functions or other arrays. This allows you to create complex timelines with nested actions.

`callback` (optional) is a function which is executed when the timeline has been completed, its signature is as follows:

    void callback()

`errorCallback` is a function which is executed if an error occurs, its signature is as follows:

    void errorCallback(message)

*Notes*
- The `timeline` parameter is optional in case you're building a timeline dynamically and in some cases it could be empty.
- Either `callback` or `errorCallback` are executed, never both.

## Where are the examples?
You can view the tests in [test/test.js](https://github.com/QuantumConcepts/easy-sync/blob/master/test/test.js), or see below.

### Simple Example
Run `action1` and `action2` (which are async functions) in sequence, the `callback` is executed once both have completed.

    sync([action1, action2], callback);

Run nested actions (in order) to create visually descriptive timelines.

    sync([
        action1,
        action2,
            [action3, action4, action5], // Actions 3, 4, and 5 are conceptually similar.
        action6],
        callback);

Run some actions in sequence and some in parallel. This example will run in sequence from top to bottom, but the `parallel2_1` and `parallel2_2` actions will run at the same time as each other. Once they complete, `sequence3` will run, and then finally the `callback` will run.

    sync([
        sequence1,
        [
            sequence2,
            sync.p([
                parallel2_1,
                parallel2_2]),
        sequence3],
        callback);
