app.factory('projects', function ( Restangular ) {
    return Restangular.all('projects');
});

app.factory('sections', function ( Restangular ) {
    return Restangular.all('sections');
});

app.factory('phases', function ( Restangular ) {
    return Restangular.all('phases');
});

// Restangular service that uses a different URL
app.factory('IJSRestangular', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl('http://sybil-api.cambridgeriskframework.com').setRequestSuffix('');
    });
});

app.factory('ijsRequest', function ( IJSRestangular ) {
    return IJSRestangular.all('');
});



// Filters

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