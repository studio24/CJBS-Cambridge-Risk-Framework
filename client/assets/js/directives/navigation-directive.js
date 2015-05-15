angular.module('crsNavigation', [])
    .controller('crsSectionNavigationDirectiveController', function ( $scope, $state, $element, $window ) {

        console.log('Section navigation scope: ',$scope);

        $scope.state = $state;

        $scope.goToSection = function ( selectedSection ) {
            console.log('Section selected:', selectedSection);

            if ( selectedSection <= $scope.sections.length && selectedSection > 0 ) {
                $state.go('section', {
                    'sectionNumber': selectedSection
                },
                {
                    reload: true
                });
            }
        };

        $scope.nextSection = function () {
            var nextSection = parseInt($state.params.sectionNumber) + 1;
            if ( nextSection <= $scope.sections.length ) {
                return nextSection;
            } else {
                return false;
            }
        };

        $scope.prevSection = function () {
            var prevSection = parseInt($state.params.sectionNumber) - 1;
            if ( prevSection > 0 ) {
                return prevSection;
            } else {
                return false;
            }
        };

    })
    .directive('crsSectionNavigation', function() {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'directives/section-navigation.html',
            scope: {
                sections        : '=',
                currentSection  : '='
            },
            controller: 'crsSectionNavigationDirectiveController'
        };
    })
    .controller('crsPhaseNavigationDirectiveController', function ( $scope, $state, $element, $window ) {

        console.log('Phase navigation scope: ',$scope);
        $scope.state = $state;


    })
    .directive('crsPhaseNavigation', function() {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'directives/phase-navigation.html',
            scope: {
                phases  : '='
            },
            controller: 'crsPhaseNavigationDirectiveController'
        };
    });