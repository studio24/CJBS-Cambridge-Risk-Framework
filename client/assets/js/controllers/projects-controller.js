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