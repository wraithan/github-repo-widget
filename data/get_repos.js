if (typeof(githubRepoWidget) === 'undefined') {
    var githubRepoWidget = {};
}

githubRepoWidget.loaded = false;
githubRepoWidget.tab = 'user';

githubRepoWidget.log = function(message) {
    addon.port.emit('log','get_repos.js: ' + message);
};

githubRepoWidget.openPrefs = function() {
    addon.port.emit('openPrefs');
};

addon.port.on('show', function(storage) {
    if (!githubRepoWidget.loaded || !githubRepoWidget.isCacheValid(storage)) {
        $('#repositories').html('');
        if (storage.repositories && githubRepoWidget.isCacheValid(storage)) {
            githubRepoWidget.log('From Storage!');
            githubRepoWidget.loadReposIntoPanel(storage.repositories, storage);
        } else {
            githubRepoWidget.log('From GitHub!');
            if (!storage.prefs.githubUsername) {
                $('#repositories').append('No GitHub Username found. Please enter one.');
                githubRepoWidget.loaded = false;
                return;
            }
            if (githubRepoWidget.tab == 'user') {
                addon.port.emit('loadAllRepos');
            } else if (storage.prefs.githubAPIToken) {
                if (githubRepoWidget.tab == 'orgs') {
                    addon.port.emit('loadOrgRepos');
                } else if (githubRepoWidget.tab == 'watched') {
                    addon.port.emit('loadWatchedRepos');
                }
            } else {
                $('#repositories').append('No GitHub API Token found. Please enter one to use these tabs.');
            }
        }
        githubRepoWidget.loaded = true;
    }
});

addon.port.on('loadPane', function(repos, storage) {
    githubRepoWidget.log('loadPane');
    githubRepoWidget.loadReposIntoPanel(repos, storage);
    addon.port.emit('store', [{'key': 'githubUsername',
                               'value': storage.prefs.githubUsername},
                              {'key': 'repositories',
                               'value': repos},
                              {'key': 'tab',
                               'value': githubRepoWidget.tab}]);

});

addon.port.on('displayPreferenceChanged', function() {
    githubRepoWidget.loaded = false;
});

githubRepoWidget.refresh = function() {
    addon.port.emit('store', [{'key': 'last_updated_at',
                               'value': 0}]);
    addon.port.emit('refresh');
};

githubRepoWidget.selectActiveTab = function(name) {
    githubRepoWidget.log('Tab change: ' + name);
    $('.active').removeClass('active');
    $('.' + name).addClass('active');
    githubRepoWidget.tab = name;
    githubRepoWidget.refresh();
};

githubRepoWidget.isCacheValid = function(storage) {
    var newEnough = ((Date.now() - storage.last_updated_at) < 1000*60*storage.prefs.refreshRate);
    var sameUser = storage.githubUsername == storage.prefs.githubUsername;
    var sameTab = storage.tab == githubRepoWidget.tab;
    return newEnough && sameUser && sameTab;
};

githubRepoWidget.loadReposIntoPanel = function(data, storage) {
    var repositories = data;
    if (data === null) {
        $('#repositories').append('No repositories found.');
        return;
    } else if ('repositories' in data) {
        repositories = data.repositories;
    } else if ('error' in data) {
        $('#repositories').append($('<p>', {text: data.error}));
        return;
    }
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
    var link = function(url, name) {
        return $('<td>').append($('<a>', {
            'href': url,
            'target': '_blank',
            'text': name
        }));
    };
    repositories.forEach(function(element) {
        var repo = $('<tr>', {
            'class': 'repo'
        });
        $('#repositories').append(repo);

        repo.append($('<td>', {
            'class': 'name',
            'text': element.name
        }));
        repo.append(link(element.url, 'Code'));
        if (storage.prefs.showIssues) {
            if (element.has_issues) {
                repo.append(link(element.url+'/issues', 'Issues'));
            } else {
                repo.append($('<td>'));
            }
        }
        if (storage.prefs.showWiki) {
            if (element.has_wiki) {
                repo.append(link(element.url+'/wiki', 'Wiki'));
            } else {
                repo.append($('<td>'));
            }
        }
        if (storage.prefs.showHomePage) {
            if ('homepage' in element && element.homepage) {
                var homepage = element.homepage;
                if (homepage.indexOf('://') == -1) {
                    homepage = 'http://' + homepage;
                }
                repo.append(link(homepage, 'Home Page'));
            } else {
                repo.append($('<td>'));
            }
        }
    });
    addon.port.emit('store', [{'key': 'last_updated_at',
                               'value': Date.now()}]);
};
