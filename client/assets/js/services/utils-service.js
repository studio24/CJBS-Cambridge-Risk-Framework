app.factory('utilsService', function ( FoundationApi, $rootScope ) {
    return {
        alert: function ( options ) {
            $rootScope.modal = options;
            FoundationApi.publish('main-modal', 'show');
        },
        notify: function ( options ) {
            FoundationApi.publish('main-notifications', options);
        }
    }
});