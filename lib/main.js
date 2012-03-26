var Widget = require("widget").Widget;
var Panel = require("panel").Panel;
var data = require("self").data;
var storage = require("simple-storage").storage;
var prefSet = require("simple-prefs");
var GitHub = require("github").GitHub;

function log(message) {
    console.log('main.js: ' + message);
}

exports.main = function() {
    var openPrefs = function () {
        require('window-utils').activeBrowserWindow.BrowserOpenAddonsMgr(
            "addons://detail/"+require("self").id
        );
    };
    if (storage.prefs === undefined) {
        storage.prefs = {};
    }
    var prefHandler = function(prefName) {
        storage.prefs[prefName] = prefSet.prefs[prefName];
        log('pref changed: ' + prefName);
    };
    var displayPrefHandler = function(prefName) {
        prefHandler(prefName);
        panel.port.emit("displayPreferenceChanged");
    };
    prefHandler("githubUsername");
    prefHandler("githubAPIToken");
    prefHandler("refreshRate");
    prefHandler("showIssues");
    prefHandler("showWiki");
    prefHandler("showHomePage");
    prefSet.on("githubUsername", prefHandler);
    prefSet.on("githubAPIToken", prefHandler);
    prefSet.on("refreshRate", prefHandler);
    prefSet.on("showIssues", displayPrefHandler);
    prefSet.on("showWiki", displayPrefHandler);
    prefSet.on("showHomePage", displayPrefHandler);

    var panel = Panel({
        width: 400,
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
    panel.port.on('refresh', function() {
        log('refresh');
        panel.port.emit("show", storage);
    });
    panel.port.on('openPrefs', function() {
        openPrefs();
    });
    panel.port.on('loadAllRepos', function(){
        gh = new GitHub(prefSet.prefs.githubUsername,
                        prefSet.prefs.githubAPIToken);
        gh.getRepos(function(repos) {
            panel.port.emit('loadPane', repos, storage);
        });
    })
    panel.port.on('loadOrgRepos', function(){
        gh = new GitHub(prefSet.prefs.githubUsername,
                        prefSet.prefs.githubAPIToken);
        gh.getOrgRepos(function(repos) {
            panel.port.emit('loadPane', repos, storage);
        });
    })
    panel.port.on('loadWatchedRepos', function(){
        gh = new GitHub(prefSet.prefs.githubUsername,
                        prefSet.prefs.githubAPIToken);
        gh.getWatchedRepos(function(repos) {
            panel.port.emit('loadPane', repos, storage);
        });
    })

    new Widget({
        id: "github-repo-widget",
        label: "Github Repo Widget",
        contentURL: data.url("github.ico"),
        panel: panel
    });
};

log("The add-on is running.");
