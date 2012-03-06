var Widget = require("widget").Widget;
var Panel = require("panel").Panel;
var data = require("self").data;
var storage = require("simple-storage").storage;
var prefSet = require("simple-prefs");

exports.main = function() {
    if (storage.prefs === undefined) {
        storage.prefs = {};
    }
    storage.prefs.githubUsername = prefSet.prefs.githubUsername;
    storage.prefs.refreshRate = prefSet.prefs.refreshRate;

    var prefHandler = function(prefName) {
        storage.prefs[prefName] = prefSet.prefs[prefName];
    };
    prefSet.on("githubUsername", prefHandler);
    prefSet.on("refreshRate", prefHandler);
    var panel = Panel({
        contentURL: data.url("panel.html")
    });
    panel.on('show', function() {
        panel.port.emit("show", storage);
    });
    panel.port.on('log', function(message) {
        console.log(message);
    });
    panel.port.on('store', function(message) {
        message.forEach(function(element) {
            storage[element.key] = element.value;
        });
    });

    new Widget({
        id: "github-repo-widget",
        label: "Github Repo Widget",
        contentURL: "http://github.com/favicon.ico",
        panel: panel
    });
};

console.log("The add-on is running.");
