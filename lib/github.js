const Request = require('request').Request;
var Base64 = require('base64').Base64;

var github = function(username, api_token) {
    this.username = username;
    this.api_token = api_token;
    this.url = "https://github.com/api/v2/json"

}

github.prototype.headers = function(method) {
    var auth = this.username + "/token:" + this.api_token;
    return {Authorization: "Basic " + Base64.encode(auth)};
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
        headers: this.headers(),
        onComplete: function(response){
            callback(response.json);
        }
    }).get();
};

github.prototype.getWatchedRepos = function(callback) {
    Request({
        url: this.url + '/repos/watched/' + this.username,
        headers: this.headers(),
        onComplete: function(response){
            callback(response.json);
        }
    }).get();
};

exports.GitHub = github;
