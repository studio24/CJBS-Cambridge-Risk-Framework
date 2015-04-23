app.controller('crfProjectListController', function ( $scope, projectList ) {

    $scope.projects = projectList;
    console.log( 'Projects added to scope:', $scope.projects );

    $scope.searchText = '';

});

app.controller('crfProjectController', ['FoundationApi', '$scope', 'project', function(FoundationApi, $scope, project) {

    $scope.project = project;
    console.log( 'Project added to scope:', $scope.project );

    // If this level has content, it needs to be displayed so add it to the scope. Child levels will overwrite the content when called
    $scope.content = project;

}]);

app.controller('crfSectionController', function ( $scope, section ) {

    $scope.section = section;
    console.log( 'Section added to scope:', $scope.section );

    // If this level has content, it needs to be displayed so add it to the scope. Child levels will overwrite the content when called
    $scope.content = section;

});

app.controller('crfPhaseController', function ( $scope, phase ) {

    $scope.phase = phase;
    console.log( 'Phase added to scope:', $scope.phase );

    // If this level has content, it needs to be displayed so add it to the scope. Child levels will overwrite the content when called
    $scope.content = phase;

});

app.controller('crfVisualisationController', function ( $scope, visualisation ) {

    $scope.visualisation = visualisation;
    console.log( 'Visualisation added to scope:', $scope.visualisation );

    // Chart drawing logic goes here
    $scope.loadVisualisation = function(visualisation) {
        S24.Charts.createForceDirectedGraph('.visualisation', visualisation.graph1, {
            width: '100%',
            height: 1000
        }, $scope);
    };

    $scope.loadVisualisation( $scope.visualisation );

});