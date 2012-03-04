addon.port.on("show", function() {
    var user = gh.user("wraithan");
    user.repos(function(data) {
        data.repositories.forEach(function(element) {
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
                repo.append(
                    $("<td></td>").append($('<a href="' + element.homepage +'" target="_blank"></a>').append("Home Page"))
                );
            } else {
                repo.append($("<td></td>"));
            }
        });
    });
});
