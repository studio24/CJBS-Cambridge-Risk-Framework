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

app.filter('exact', function(){
    return function(items, match){
        var matching = [], matches, falsely = true;

        // Return the items unchanged if all filtering attributes are falsy
        angular.forEach(match, function(value, key){
            falsely = falsely && !value;
        });
        if(falsely){
            return items;
        }

        angular.forEach(items, function(item){ // e.g. { title: "ball" }
            matches = true;
            angular.forEach(match, function(value, key){ // e.g. 'all', 'title'
                if(!!value){ // do not compare if value is empty
                    matches = matches && (item[key] === value);
                }
            });
            if(matches){
                matching.push(item);
            }
        });
        return matching;
    }
});