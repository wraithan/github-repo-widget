var loaded = false;

function log(message) {
    addon.port.emit('log','get_repos.js: ' + message);
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
                addon.port.emit("openPrefs");
                $("#repositories").append("No GitHub Username found. Please enter one.");
                loaded = false;
                return;
            }
            var user = gh.user(storage.prefs.githubUsername);
            user.allRepos(function(data) {
                loadReposIntoPanel(data.repositories, storage);
                addon.port.emit("store", [{"key": "githubUsername",
                                           "value": storage.prefs.githubUsername},
                                          {"key": "repositories",
                                           "value": data.repositories}]);
            });
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
}

function userRepos() {
    selectActiveTab('user');
    log("userRepos");
}

function orgRepos() {
    selectActiveTab('orgs');
    log("orgRepos");
}

function watchedRepos() {
    selectActiveTab('watched');
    log("watchedRepos");
}

function isCacheValid(storage) {
    return ((Date.now() - storage.last_updated_at) < 1000*60*storage.prefs.refreshRate) && storage.githubUsername == storage.prefs.githubUsername;
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
