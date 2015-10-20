app.controller('crsTutorial1Controller', ['$scope', function ( $scope ) {

    $scope.citiesList = [
        {
            "name"          :   "London",
            "population"    :   1236576
        },
        {
            "name"          :   "New York",
            "population"    :   5345435
        },
        {
            "name"          :   "Tokyo",
            "population"    :   7345345
        }
    ];

}]);






app.controller('crsTotalPopulation', function ( $scope ) {

    $scope.$watch('cities', function() {

        $scope.totalPopulation = 0;

        angular.forEach($scope.cities, function(city){
            if (city.population) {
                $scope.totalPopulation += parseInt(city.population);
            }
        });

    }, true);

});

app.directive('crsTotalPopulation', function() {
    return {
        restrict: 'E',
        scope: {
            cities: '='
        },
        templateUrl: 'directives/total-population.html',
        controller: 'crsTotalPopulation'
    };
});



app.controller('crsHelloWorldController', function ( $scope, $stateParams ) {

    $scope.myName = $stateParams.myName;

});




















app.controller('crsRootController', ['$scope', 'Fullscreen', 'utilsService', 'projectStatus', function ( $scope, Fullscreen, utilsService, projectStatus ) {

    $scope.fullscreenSupported = Fullscreen.isSupported();

    $scope.projectStatus = projectStatus;

    if ($scope.fullscreenSupported) {

        // Add a function to the scope to toggle fullscreen mode.
        $scope.goFullscreen = function () {

            if ( Fullscreen.isEnabled() ) {

                Fullscreen.cancel();

            } else {

                Fullscreen.all();

            }
        };

        // Listen for changes to fullscreen mode
        Fullscreen.$on('FBFullscreen.change', function(){

            // Update fullscreen parameter on scope so that the icon can be updated
            $scope.$apply(function() {
                $scope.fullscreen = Fullscreen.isEnabled();
            });

        });
    }

}]);

app.controller('crsProjectListController', ['$scope', 'projectList', function ( $scope, projectList ) {

    $scope.projects = projectList;

    if (crsConfig.debug) {
        console.log( 'Project list added to scope:', $scope.projects );
    }

}]);

app.controller('crsProjectController', ['FoundationApi', '$scope', 'project', 'projectSummary', '$state', '$stateParams', 'utilsService', 'projectStatus', function(FoundationApi, $scope, project, projectSummary, $state, $stateParams, utilsService, projectStatus) {

    $scope.project = project;

    if (crsConfig.debug) {
        console.log('Project added to scope:', $scope.project);
    }

    projectStatus.project = 'loaded';

    $scope.projectSummary = $scope.projectSummary || projectSummary;

    var modal = {};

    modal.projectSummary = $scope.projectSummary;
    modal.projectStatus = projectStatus;

    projectStatus.projectSummary = $scope.projectSummary || projectSummary;

    // If this level has content, it needs to be displayed so add it to the scope. Child levels will overwrite the content when called
    $scope.content = project;

    $scope.showSummary = function(){
        utilsService.modal.show(modal);
    };

    var parentState = 'project',
        defaultChildState = 'section';

    // Check if the project has been accessed directly
    if($state.current.name.substr(-parentState.length) === parentState) {

        // The project has been accessed directly. Load the first section
        $state.go(defaultChildState, {
                'sectionNumber': 1
            },
            {
                'location'   :   'replace'
            });
    }


}]);

app.controller('crsSectionController', ['$scope', '$sce', 'section', '$state', 'projectStatus', '$timeout', '$window', function ( $scope, $sce, section, $state, projectStatus, $timeout, $window ) {

    $scope.section = section;

    if (crsConfig.debug) {
        console.log('Section added to scope:', $scope.section);
    }

    var parentState = 'section',
        defaultChildState = 'phase';

    // Check if the section has been accessed directly
    if($state.current.name.substr(-parentState.length) === parentState) {

        // The section has been accessed directly. Check if it contains any phases
        if ( $scope.section.phases.length > 0 ) {

            // The section contains phases. Load the first phase
            $state.go(defaultChildState, {
                'phaseNumber': 1
            });

        } else {
            $scope.content = section;

            projectStatus.content = 'loaded';
        }
    }

    // Trust HTML so that inline styles work
    if (section.infopanel.body && typeof(section.infopanel.body) == 'string') {
        $scope.content.infopanel.body = $sce.trustAsHtml(section.infopanel.body);
    }

    var defaultVisualisation;

    if ( typeof($scope.content.defaultvisibility) != 'undefined' ) {

        defaultVisualisations = $scope.content.defaultvisibility;

    } else {

        defaultVisualisations = [Object.keys( $scope.content.visualisations )[0]];

    }

    var setDefaultState = function (visualisationType) {

        var visibleByDefault = false;

        var lookup = {
            graph   :   'graphs',
            list    :   'layers',
            map     :   'maps',
            chart   :   'charts'
        };
        for ( var i = 0; i < defaultVisualisations.length; i++ ) {
            if ( lookup[defaultVisualisations[i]] == visualisationType ) {
                visibleByDefault = true;
                return visibleByDefault;
            }
        }

        return visibleByDefault;

    };


    angular.extend($scope, {
        visualisations  : [],
        activeCount     : 0
    });

    $scope.visualisationStatus = {
        count: 0
    };

    for (var key in $scope.content.visualisations) {

        if ($scope.content.visualisations.hasOwnProperty(key)) {

            projectStatus.updateVisualisations($scope.visualisationType, 'pending');

            var visualisation = {
                visualisationType: key,
                visualisationUrl: $scope.content.visualisations[key],
                active: setDefaultState(key)
            };

            $scope.visualisations.push(visualisation);

            if ( visualisation.active ) {
                $scope.visualisationStatus.count++;
            }

        }
    }

    $scope.$watch('visualisationStatus', function() {
        angular.element($window).trigger('resize');
        $timeout(function(){
            angular.element($window).trigger('resize');
        }, 300);
    }, true);

    $scope.toggleVisualisation = function ( _visualisation ) {

        if ( _visualisation.active ) {

            if ( $scope.visualisationStatus.count > 1 ) {

                _visualisation.active = false;
                $scope.visualisationStatus.count--;

            }

        } else {

            if ( $scope.visualisationStatus.count < 3 ) {

                _visualisation.active = true;
                $scope.visualisationStatus.count++;

            }

        }

    };

}]);

app.controller('crsPhaseNavigationController', ['$scope', 'section', function ( $scope, section ) {

    $scope.section = section;

}]);

app.controller('crsPhaseController', ['$scope', '$sce', 'phase', '$state', '$window', '$timeout', 'projectStatus', function ( $scope, $sce, phase, $state, $window, $timeout, projectStatus ) {

    $scope.phase = phase;

    if (crsConfig.debug) {
        console.log('Phase added to scope:', $scope.phase);
    }

    projectStatus.content = 'loaded';

    // Load the phase content into the scope
    $scope.content = phase;

    // Trust HTML so that inline styles work
    if (phase.infopanel.body && typeof(phase.infopanel.body) == 'string') {
        $scope.content.infopanel.body = $sce.trustAsHtml(phase.infopanel.body);
    }

    var parentState = 'phase';

    var defaultVisualisation;

    if ( typeof($scope.content.defaultvisibility) != 'undefined' ) {

        defaultVisualisations = $scope.content.defaultvisibility;

    } else {

        defaultVisualisations = [Object.keys( $scope.content.visualisations )[0]];

    }

    var setDefaultState = function (visualisationType) {

        var visibleByDefault = false;

        var lookup = {
            graph   :   'graphs',
            list    :   'layers',
            map     :   'maps',
            chart   :   'charts'
        };
        for ( var i = 0; i < defaultVisualisations.length; i++ ) {
            if ( lookup[defaultVisualisations[i]] == visualisationType ) {
                visibleByDefault = true;
                return visibleByDefault;
            }
        }

        return visibleByDefault;

    };

    angular.extend($scope, {
        visualisations  : [],
        activeCount     : 0
    });

    $scope.visualisationStatus = {
        count: 0
    };

    for (var key in $scope.content.visualisations) {

        if ($scope.content.visualisations.hasOwnProperty(key)) {

            projectStatus.updateVisualisations($scope.visualisationType, 'pending');

            var visualisation = {
                visualisationType: key,
                visualisationUrl: $scope.content.visualisations[key],
                active: setDefaultState(key)
            };

            $scope.visualisations.push(visualisation);

            if ( visualisation.active ) {
                $scope.visualisationStatus.count++;
            }

        }
    }

    $scope.$watch('visualisationStatus', function() {
        angular.element($window).trigger('resize');
        $timeout(function(){
            angular.element($window).trigger('resize');
        }, 300);
    }, true);

    $scope.toggleVisualisation = function ( _visualisation ) {

        if ( _visualisation.active ) {

            if ( $scope.visualisationStatus.count > 1 ) {

                _visualisation.active = false;
                $scope.visualisationStatus.count--;

            }

        } else {

            if ( $scope.visualisationStatus.count < 3 ) {

                _visualisation.active = true;
                $scope.visualisationStatus.count++;

            }

        }

    };

}]);