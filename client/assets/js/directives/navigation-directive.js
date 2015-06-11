angular.module('crsNavigation', [])
    .controller('crsProjectFiltersDirectiveController', function ( $scope, $state, $element, $window, threats, threatclasses, typecodes ) {

        console.log('Project filters scope: ',$scope);
        $scope.state = $state;

        threats.getList().then(function( data ) {
            $scope.threatsList = data;
        });
        threatclasses.getList().then(function( data ) {
            $scope.threatclassesList = data;
        });
        typecodes.getList().then(function( data ) {
            $scope.typecodesList = data;
        });



    })
    .directive('crsProjectFilters', function() {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'directives/project-filters.html',
            scope: {
                filters : '='
            },
            controller: 'crsProjectFiltersDirectiveController'
        };
    })
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

        $scope.goToPhase = function ( selectedPhase ) {
            console.log('Phase selected:', selectedPhase);

            if ( selectedPhase <= $scope.phases.length && selectedPhase > 0 ) {
                $state.go('phase', {
                    'phaseNumber': selectedPhase
                });
            }
        };

        $scope.nextPhase = function () {
            var nextPhase = parseInt($state.params.phaseNumber) + 1;
            if ( nextPhase <= $scope.phases.length ) {
                return nextPhase;
            } else {
                return false;
            }
        };

        $scope.prevPhase = function () {
            var prevPhase = parseInt($state.params.phaseNumber) - 1;
            if ( prevPhase > 0 ) {
                return prevPhase;
            } else {
                return false;
            }
        };


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