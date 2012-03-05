var Widget = require("widget").Widget;
var Panel = require("panel").Panel;
var data = require("self").data;
var storage = require("simple-storage").storage;

exports.main = function() {
    var panel = Panel({
        contentURL: data.url("panel.html")
    });
    panel.on('show', function() {
        panel.port.emit("show", storage);
    });
    panel.port.on('log', function(message) {
        console.log(message);
    })

    new Widget({
        id: "github-repo-widget",
        label: "Github Repo Widget",
        contentURL: "http://github.com/favicon.ico",
        panel: panel
    });
};

console.log("The add-on is running.");
