app.factory('projects', function ( Restangular ) {
    return Restangular.all('projects');
});

app.factory('sections', function ( Restangular ) {
    return Restangular.all('sections');
});

app.factory('phases', function ( Restangular ) {
    return Restangular.all('phases');
});

app.filter('getByAttr', function() {
    var getByAttr = function(input, attr, val) {
        var i=0, len=input.length;
        for (; i<len; i++) {
            if (+input[i][attr] == +val) {
                return input[i];
            }
        }
        return null;
    };
    return getByAttr;
});