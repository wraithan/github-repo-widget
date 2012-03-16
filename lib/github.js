const Request = require('request').Request;

var github = function(username, api_token) {
    this.username = username;
    this.api_token = api_token;
    this.url = "https://api.github.com";

}

github.prototype.getRepos = function(callback) {
    Request({
        url: this.url + '/users/' + this.username + '/repos',
        onComplete: function(response){
            var repos = JSON.parse(response.text);
            callback(repos);
        }
    }).get();
}

exports.GitHub = github;
