const Request = require('request').Request;

var github = function(username, api_token) {
    this.username = username;
    this.api_token = api_token;
    this.url = "https://github.com/api/v2/json"

}

github.prototype.headers = function(method) {
    return {Authorization: "Basic " + this.username + "/token:" + this.api_token}
};

github.prototype.getRepos = function(callback) {
    Request({
        url: this.url + '/repos/show/' + this.username,
        headers: this.headers(),
        onComplete: function(response){
            callback(response.json);
        }
    }).get();
};

github.prototype.getOrgRepos = function(callback) {
    Request({
        url: this.url + '/organizations/repositories',
        content: {login: this.username,
                  token: this.api_token},
        headers: this.headers(),
        onComplete: function(response){
            console.log(JSON.stringify(response.headers));
            callback(response.json);
        }
    }).get();
};

github.prototype.getWatchedRepos = function(callback) {
    Request({
        url: this.url + '/repos/watched/' + this.username,
        onComplete: function(response){
            callback(response.json);
        }
    }).get();
};

exports.GitHub = github;
