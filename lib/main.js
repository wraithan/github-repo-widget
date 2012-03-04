var Widget = require("widget").Widget;
var Panel = require("panel").Panel;
var data = require("self").data;

exports.main = function() {
    var panel = Panel({
        height: 500,
        width: 500,
        contentURL: data.url("panel.html")
    });
    panel.on('show', function() {
        panel.port.emit("show");
    });

    new Widget({
        id: "github-repo-widget",
        label: "Github Repo Widget",
        contentURL: "http://github.com/favicon.ico",
        panel: panel
    });
};

console.log("The add-on is running.");
