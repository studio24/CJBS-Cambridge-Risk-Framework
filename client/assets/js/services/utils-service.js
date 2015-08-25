app.factory('utilsService', function ( FoundationApi, $rootScope ) {
    return {
        modal: {
            show: function ( options ) {
                $rootScope.modal = options;
                $.magnificPopup.open({
                    items: {
                        src: '#loading-modal',
                        type: 'inline'
                    }
                });
            },
            hide: function () {
                $.magnificPopup.close();
            }
        },
        notify: function ( options ) {
            FoundationApi.publish('main-notifications', options);
        }
    }
});