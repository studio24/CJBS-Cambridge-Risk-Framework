app.controller('crsProjectListController', function ( $scope, projectList ) {

    $scope.projects = projectList;
    console.log( 'Projects added to scope:', $scope.projects );

    $scope.searchText = '';

});

app.controller('crsProjectController', ['FoundationApi', '$scope', 'project', '$state', '$stateParams', function(FoundationApi, $scope, project, $state, $stateParams) {

    $scope.project = project;
    console.log( 'Project added to scope:', $scope.project );

    // If this level has content, it needs to be displayed so add it to the scope. Child levels will overwrite the content when called
    $scope.content = project;

    console.log($stateParams);

    var parentState = 'project',
        defaultChildState = 'section';

    // Chech if the project has been accessed directly
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

            // Check if the section has a default visualisation set
            if ( $scope.content.defaultvisibility && $scope.content.defaultvisibility != '' ) {

                // The default visualisation is set, so load that visualisation
                $state.go('section.visualisation', {
                    'visualisationType': $scope.content.defaultvisibility
                },
                {
                    'location'   :   'replace'
                });

            }
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

        // Check if the phase has a default visualisation set
        if ($scope.content.defaultvisibility && $scope.content.defaultvisibility != '') {

            // The default visualisation is set, so load that visualisation
            $state.go(defaultChildState, {
                'visualisationType': $scope.content.defaultvisibility
            },
            {
                'location'   :   'replace'
            });

        }

    }

});

app.controller('crsVisualisationController', function ( $scope, $stateParams, visualisation ) {

    $scope.visualisation = {
        visualisationData   :   visualisation.originalElement,
        visualisationType   :   $stateParams.visualisationType
    };
    console.log( 'Visualisation added to scope:', $scope.visualisation );

});