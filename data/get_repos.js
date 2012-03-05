var loaded = false;

addon.port.on("show", function(storage) {
    if (!loaded) {
        if (storage.repositories) {
            loadReposIntoPanel(storage.repositories);
        } else {
            var user = gh.user("wraithan");
            user.allRepos(function(data) {
                loadReposIntoPanel(data.repositories);
                storage.repositories = data.repositories;
            });
        }
        loaded = true;
    }
});

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
