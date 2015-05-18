app.factory('APIRestangular', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl('http://sybil-api.cambridgeriskframework.com/api').setRequestSuffix('/');
        RestangularConfigurer.setResponseExtractor(function(response) {
            var newResponse = response.originalElement;
            return newResponse;
        });
    });
});

app.factory('apiRequest', function ( APIRestangular ) {
    return APIRestangular.all('');
});

app.factory('projects', function ( apiRequest ) {
    return apiRequest.all('projects');
});

app.factory('sections', function ( apiRequest ) {
    return apiRequest.all('sections');
});

app.factory('phases', function ( apiRequest ) {
    return apiRequest.all('phases');
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