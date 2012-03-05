var loaded = false;

addon.port.on("show", function(storage) {
    if (!loaded || !isCacheValid(storage)) {
        $("#repositories").html("");
        addon.port.emit("log", "Loading!");
        if (storage.repositories && isCacheValid(storage)) {
            addon.port.emit("log", "From Storage!");
            loadReposIntoPanel(storage.repositories);
        } else {
            addon.port.emit("log", "From GitHub!");
            var user = gh.user("wraithan");
            user.allRepos(function(data) {
                loadReposIntoPanel(data.repositories);
                addon.port.emit("store", [{"key": "last_updated_at",
                                           "value": Date.now()},
                                          {"key": "user",
                                           "value": "wraithan"},
                                          {"key": "repositories",
                                           "value": data.repositories}])
            });
        }
        loaded = true;
    }
});

function isCacheValid(cache) {
    return ((Date.now() - cache.last_updated_at) < 1000*60*10)
}

function loadReposIntoPanel(repositories) {
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
        if (element.has_issues) {
            repo.append(
                $("<td></td>").append($('<a href="' + element.url +'/issues" target="_blank"></a>').append("Issues"))
            );
        } else {
            repo.append($("<td></td>"));
        }
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
    });
}
