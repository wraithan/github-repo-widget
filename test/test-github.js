const GitHub = require("github").GitHub;

function test_getRepos(test) {
    var gh = new GitHub('wraithan');
    gh.getRepos(function(repos) {
        repos.forEach(function(element){
            console.log(element.name);
        });
        test.assert(true);
        test.done();
    });
    test.waitUntilDone(5000);
};

exports.test_getRepos = test_getRepos;
