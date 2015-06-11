app.controller('crsRootController', ['$scope', 'Fullscreen', function ( $scope, Fullscreen ) {

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

}]);

app.controller('crsProjectListController', ['$scope', 'projectList', function ( $scope, projectList ) {

    $scope.projects = projectList;
    console.log( 'Projects added to scope:', $scope.projects );

    // Set the search text as a variable so we can filter by it when the user enters their search terms.
    $scope.filters = {
        name            :   '',
        threat          :   '',
        threatclass     :   '',
        typecode        :   ''
    };

}]);

app.controller('crsProjectController', ['FoundationApi', '$scope', 'project', '$state', '$stateParams', function(FoundationApi, $scope, project, $state, $stateParams) {

    $scope.project = project;
    console.log( 'Project added to scope:', $scope.project );

    // If this level has content, it needs to be displayed so add it to the scope. Child levels will overwrite the content when called
    $scope.content = project;

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
    } else {

        $state.go('section.visualisation', {
                'visualisationType': 'visualisation'
            },
            {
                'location'   :   'replace'
            });

    }


}]);

app.controller('crsSectionController', function ( $scope, section, $state ) {

    $scope.section = section;
    console.log( 'Section added to scope:', $scope.section );

    $scope.content = section;

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

            $state.go('section.visualisation', {
                    'visualisationType': 'visualisation'
                },
                {
                    'location'   :   'replace'
                });

        }

    }

});

app.controller('crsPhaseController', function ( $scope, phase, $state ) {

    $scope.phase = phase;
    console.log( 'Phase added to scope:', $scope.phase );

    // Load the phase content into the scope
    $scope.content = phase;

    var parentState = 'phase',
        defaultChildState = 'phase.visualisation';

    // Check if the phase has been accessed directly
    if($state.current.name.substr(-parentState.length) === parentState) {

        $state.go('phase.visualisation', {
                'visualisationType': 'visualisation'
            },
            {
                'location'   :   'replace'
            });

    }

});

app.controller('crsVisualisationController', ['$scope', '$stateParams', '$timeout', function ( $scope, $stateParams, $timeout ) {

    console.log('Loading...');

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
            list    :   'layers'
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

    $scope.$watch('activeCount', function() {
        $timeout(function(){
            window.dispatchEvent(new Event('resize'));
        });

    });

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