var github = {};
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
            addon.port.emit('log', 'success');
            callback(reply);
        },
        error: function(jqXHR, error, errorThrown) {
            addon.port.emit('log', JSON.stringify(jqXHR));
            addon.port.emit('log', error);
            addon.port.emit('log', errorThrown);

        }
    });
};
