var loaded = false;
var tab = 'user';

function log(message) {
    addon.port.emit('log','get_repos.js: ' + message);
}

function openPrefs() {
    addon.port.emit('openPrefs');
}

addon.port.on("show", function(storage) {
    if (!loaded || !isCacheValid(storage)) {
        $("#repositories").html("");
        log("Loading! loaded:" + loaded + " cache:" + isCacheValid(storage));
        if (storage.repositories && isCacheValid(storage)) {
            log("From Storage!");
            loadReposIntoPanel(storage.repositories, storage);
        } else {
            log("From GitHub!");
            if (!storage.prefs.githubUsername) {
                $("#repositories").append("No GitHub Username found. Please enter one.");
                loaded = false;
                return;
            }
            if (storage.prefs.githubAPIToken) {
                gh.authenticate(storage.prefs.githubUsername,
                                storage.prefs.githubAPIToken);
            }
            var user = gh.user(storage.prefs.githubUsername);
            var processRepos = function(data) {
                loadReposIntoPanel(data.repositories, storage);
                addon.port.emit("store", [{"key": "githubUsername",
                                           "value": storage.prefs.githubUsername},
                                          {"key": "repositories",
                                           "value": data.repositories},
                                          {"key": "tab",
                                           "value": tab}]);
            };
            if (tab == 'user') {
                user.allRepos(processRepos);
            } else if (storage.prefs.githubAPIToken) {
                if (tab == 'orgs') {
                    user.allOrgRepos(processRepos);
                } else if (tab == 'watched') {
                    user.watching(processRepos);
                }
            } else {
                $("#repositories").append("No GitHub API Token found. Please enter one to use these tabs.");
            }
        }
        loaded = true;
    }
});

addon.port.on("displayPreferenceChanged", function() {
    loaded = false;
});

function refresh() {
    addon.port.emit("store", [{"key": "last_updated_at",
                               "value": 0}]);
    addon.port.emit("refresh");
}

function selectActiveTab(name) {
    $('.active').removeClass('active');
    $('.' + name).addClass('active');
    tab = name;
}

function changeTab(tab) {
    log("change tab: " + tab);
    selectActiveTab(tab);
    addon.port.emit("refresh");
}

function isCacheValid(storage) {
    var newEnough = ((Date.now() - storage.last_updated_at) < 1000*60*storage.prefs.refreshRate);
    var sameUser = storage.githubUsername == storage.prefs.githubUsername;
    var sameTab = storage.tab == tab;
    return newEnough && sameUser && sameTab;
}

function loadReposIntoPanel(repositories, storage) {
    repositories.sort(function(a, b) {
        if ('pushed_at' in a && !('pushed_at' in b)) {
            return -1;
        } else if ('pushed_at' in b && !('pushed_at' in a)) {
            return 1;
        } else if (!('pushed_at' in b) && !('pushed_at' in a)) {
            return 0;
        } else if (a.pushed_at > b.pushed_at) {
            return -1;
        } else if (b.pushed_at > a.pushed_at) {
            return 1;
        } else {
            return 0;
        }
    });
    repositories.forEach(function(element) {
        var repo = $('<tr class="repo"></tr>');
        $("#repositories").append(repo);

        repo.append($('<td class="name"></td>').append(element.name));
        repo.append(
            $("<td></td>").append($('<a href="' + element.url +'" target="_blank"></a>').append("Code"))
        );
        if (storage.prefs.showIssues) {
            if (element.has_issues) {
                repo.append(
                    $("<td></td>").append($('<a href="' + element.url +'/issues" target="_blank"></a>').append("Issues"))
                );
            } else {
                repo.append($("<td></td>"));
            }
        }
        if (storage.prefs.showWiki) {
            if (element.has_wiki) {
                repo.append(
                    $("<td></td>").append($('<a href="' + element.url +'/wiki" target="_blank"></a>').append("Wiki"))
                );
            } else {
                repo.append($("<td></td>"));
            }
        }
        if (storage.prefs.showHomePage) {
            if ('homepage' in element && element.homepage) {
                var homepage = element.homepage;
                if (homepage.indexOf('://') == -1) {
                    homepage = 'http://' + homepage;
                }
                repo.append(
                    $("<td></td>").append($('<a href="' + homepage +'" target="_blank"></a>').append($("<nobr></nobr>").append("Home Page")))
                );
            } else {
                repo.append($("<td></td>"));
            }
        }
    });
    addon.port.emit("store", [{"key": "last_updated_at",
                               "value": Date.now()}]);
}
