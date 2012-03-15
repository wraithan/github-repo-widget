var github = {};
github.log = function(message) {
    if (typeof(addon) === "undefined") {
        console.log(message);
    } else {
        addon.port.emit('log', message);
    }
}

github.url = "https://api.github.com";

github.user = function(user, token) {
    this.username = user;
    this.token = token;
    return this;
};

github.api_token = function() {
    if (this.token) {
        return "?api_token=" + this.token;
    }
    return "";
}

github.getRepos = function(callback) {
    var url = this.url + '/users/' + this.username + '/repos' + this.api_token();
    $.ajax(url, {
        success: function(reply) {
            github.log('success');
            callback(reply);
        },
        error: function(jqXHR, error, errorThrown) {
            github.log(JSON.stringify(jqXHR));
            github.log(error);
            github.log(errorThrown);

        }
    });
};
