app.factory('APIRestangular', function(Restangular, utilsService) {
    return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl('http://sybil-api.cambridgeriskframework.com/api').setRequestSuffix('/');
        RestangularConfigurer.setResponseExtractor(function(response) {
            var newResponse = response.originalElement;
            return newResponse;
        });
        RestangularConfigurer.setErrorInterceptor(function(response, deferred, responseHandler) {

            var responseTitle = function () {
                if (response.status && response.status != 0) {
                    return 'API connection error ' + response.status;
                } else {
                    return 'Unknown API connection error';
                }
            };

            var responseText = function () {
                if (response.statusText && response.statusText != '') {
                    return '<br/>' + response.statusText;
                } else {
                    return '';
                }
            };

            utilsService.notify({
                title       : responseTitle,
                color       : 'error',
                content     : 'Could not retrieve API data from ' + response.config.url + '.' + responseText()
            });
            return true;
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

app.factory('threats', function ( apiRequest ) {
    return apiRequest.all('threats');
});

app.factory('threatclasses', function ( apiRequest ) {
    return apiRequest.all('threatclasses');
});

app.factory('typecodes', function ( apiRequest ) {
    return apiRequest.all('typecodes');
});

// Loading states

app.factory('projectStatus', function(){

    var status = {
        project: 'pending',
        content: 'pending',
        visualisations: {
            pending: 0,
            loading: 0,
            loaded: 0
        }
    }
    status.updateVisualisations = function ( _type, _status ) {
        status.visualisations[_type] = _status;
        status.visualisations[_status]++;
    };
    status.reset = function () {
        status.project  =   'pending';
        status.content  =   'pending';
        status.visualisations = {
            pending :   0,
            loading :   0,
            loaded  :   0
        }
    };

    return status;
})

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