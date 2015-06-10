app.filter('orderObjectBy', function () {
    return function(items, field, reverse) {

        var filtered = [];
        angular.forEach(items, function(item) {
            filtered.push(item);
        });

        if( field ) {

            filtered.sort(function (a, b) {
                return (a.fields[field].v > b.fields[field].v ? 1 : -1);
            });

        } else {

            filtered.sort(function (a, b) {
                return (a.order > b.order ? 1 : -1);
            });

        }

        if(reverse) filtered.reverse();
        return filtered;

    };
});