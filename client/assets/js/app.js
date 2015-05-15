'use strict';

var app = angular.module('application', [
    'ui.router',
    'ngAnimate',
    'ngCookies',
    'ngSanitize',
    'crsVisualisations',
    'crsNavigation',
    'ui.select',
    'FBAngular',

    //foundation
    'foundation',

    'restangular'
    ])
    .config(config)
    .run(run)
;

app.$inject = ['FoundationApi'];
app.$inject = ['Hammer'];

config.$inject = ['$urlRouterProvider', '$locationProvider', '$stateProvider', 'RestangularProvider', 'uiSelectConfig'];

function config($urlProvider, $locationProvider, $stateProvider, RestangularProvider, uiSelectConfig) {

    uiSelectConfig.theme = 'select2';
    uiSelectConfig.resetSearchInput = true;
    uiSelectConfig.appendToBody = true;

    RestangularProvider.setBaseUrl('http://sybil-api.cambridgeriskframework.com/api/')
        .setRequestSuffix('/');
    RestangularProvider.setResponseExtractor(function(response) {
        var newResponse = response;
        newResponse.originalElement = angular.copy(response);
        return newResponse;
    });

    $stateProvider
        .state('root', {
            url: '',
            abstract: true,
            views       : {
                "content": {
                    templateUrl: 'templates/root.html',
                    controller: 'crsRootController'
                }
            }
        })
        .state('home', {
            resolve     : {
                projectList: [ 'projects', function( projects ) {

                    // Get the full list of projects before the controller runs.
                    return projects.getList();

                }]
            },
            url: '/',
            parent      : 'root',
            views       : {
                "content": {
                    templateUrl: 'templates/home.html',
                    controller: 'crsProjectListController'
                }
            }
        })
        .state('project', {
            resolve     : {
                project: [ '$stateParams', 'projects', function( $stateParams, projects ) {

                    var projectId = $stateParams.projectId;

                    // We have the project ID so we can get the project before the controller runs.
                    return projects.get( projectId );

                }]
            },
            url         : '/project/:projectId',
            parent      : 'root',
            views       : {
                "content": {
                    templateUrl: 'templates/project.html',
                    controller: 'crsProjectController'
                }
            }
        })
        .state('sectionroot', {
            url: '',
            parent: 'project',
            views       : {
                "content": {
                    templateUrl: 'templates/section.html',
                }
            },
            abstract: true
        })
        .state('section', {
            resolve     : {
                section: [ '$stateParams', '$filter', 'sections', 'project', function( $stateParams, $filter, sections, project ) {

                    var sectionNumber = $stateParams.sectionNumber;

                    if ( !sectionNumber ) {
                        sectionNumber = 1;
                    }

                    // We have the section number, not the ID, so we need to Loop through the sections in the current project to find the appropriate ID.
                    var sectionOverview = $filter('getByAttr')( project.sections, 'sectionnumber', sectionNumber );

                    // Now we have the section object in the parent project, so we can look up the section by ID before the controller runs.
                    var sectionId = sectionOverview.id;
                    return sections.get( sectionId );

                }]
            },
            url: '/section/:sectionNumber',
            parent: 'sectionroot',
            views       : {
                "content": {
                    templateUrl: 'templates/content.html',
                    controller: 'crsSectionController'
                },
                "phase-navigation": {
                    templateUrl: 'templates/phase-navigation.html',
                    controller: 'crsSectionController'
                }
            }
        })
        .state('section.visualisation', {
            resolve     : {
                visualisation: [ '$stateParams', '$filter', 'ijsRequest', 'section', function( $stateParams, $filter, ijsRequest, section ) {

                    var visualisationType = $stateParams.visualisationType;

                    // We have the IJS type, not the URL, so we need to grab the URL from the section object.
                    var visualisationUrl = section.visualisations[visualisationType];

                    return ijsRequest.get( visualisationUrl );

                }]
            },
            url: '/:visualisationType',
            parent: 'section',
            views: {
                "visualisation": {
                    templateUrl: 'templates/visualisation.html',
                    controller: 'crsVisualisationController'
                }
            }
        })
        .state('phase', {
            resolve     : {
                phase: [ '$stateParams', '$filter', 'phases', 'section', function( $stateParams, $filter, phases, section ) {

                    var phaseNumber = $stateParams.phaseNumber;

                    // We have the phase number, not the ID, so we need to Loop through the phases in the current section to find the appropriate ID.
                    var phaseOverview = $filter('getByAttr')( section.phases, 'phasenumber', phaseNumber );

                    // Now we have the phase object in the parent section, so we can look up the phase by ID before the controller runs.
                    var phaseId = phaseOverview.id;
                    return phases.get( phaseId );

                }]
            },
            url: '/phase/:phaseNumber',
            parent: 'section',
            views: {
                "content@sectionroot": {
                    templateUrl: 'templates/content.html',
                    controller: 'crsPhaseController'
                }
            }
        })
        .state('phase.visualisation', {
            resolve     : {
                visualisation: [ '$stateParams', '$filter', 'ijsRequest', 'phase', function( $stateParams, $filter, ijsRequest, phase ) {

                    var visualisationType = $stateParams.visualisationType;

                    // We have the IJS type, not the URL, so we need to grab the URL from the section object.
                    var visualisationUrl = phase.visualisations[visualisationType];

                    return ijsRequest.get( visualisationUrl );

                }]
            },
            url: '/:visualisationType',
            parent: 'phase',
            views: {
                "visualisation": {
                    templateUrl: 'templates/visualisation.html',
                    controller: 'crsVisualisationController'
                }
            }
        })
        .state('settings', {
            url: '/settings',
            templateUrl : 'templates/settings.html'
        });

        $urlProvider.otherwise('/');

        $locationProvider.html5Mode({
            enabled: false,
            requireBase: false
        });

        $locationProvider.hashPrefix('!');
    }

function run($rootScope, $timeout, $state, utilsService, FoundationApi) {

    $rootScope.state = {
        loading     : false,
        bodyClass   : ""
    };

    FastClick.attach(document.body);

    $rootScope
        .$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams){
            $rootScope.state.loading = true;
            $rootScope.state.bodyClass = 'loading ' + toState.name.split('.').join('-');
            console.log('State changing from "' + fromState.name + '" to "' + toState.name + '"...');
        });

    $rootScope
        .$on('$stateChangeSuccess',
        function(event, toState, toParams, fromState, fromParams){
            $rootScope.state.loading = false;
            $rootScope.state.bodyClass = 'loaded ' + toState.name.split('.').join('-');
            // Set timeout before removing the section class to allow for CSS animation.
            $timeout(function () {
                $rootScope.state.bodyClass = 'loaded';
            },300);
            console.log('State change successful.');
            //utilsService.notify({
            //    title       : 'State change successful',
            //    content     : 'From "' + ((fromState && fromState.name != '') ? fromState.name : 'no state') + '" to  "'+ (toState && toState.name) + '".',
            //    color       : 'success',
            //    autoclose   : 3000
            //});
        });

    // Report errors in state transitions
    $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {

        var errorMessage = 'Error on StateChange from: "' + (fromState && fromState.name) + '" to:  "'+ toState.name + '", err:' + error.message + ", code: " + error.status;
        console.log(errorMessage);

        if(error.status == 404 || error.status == 500 ) {

            utilsService.alert({
                title   : error.status,
                content : error.data.detail + '<br/>' +
                    'URL: ' + error.config.url
            });

        }

        $rootScope.$emit('clientmsg:error', error);
        console.log('Stack: ' + error.stack);

        utilsService.notify({
            title       : 'State change error',
            content     : 'Could not change from "' + ((fromState && fromState.name != '') ? fromState.name : 'no state') + '" to  "'+ (toState && toState.name) + '". ' +
                'Reverting to previous state.',
            color       : 'error'
        });

        $state.reload();

        // check if we tried to go to a home state, then we cannot redirect again to the same
        // homestate, because that would lead to a loop
        //if (toState.name === 'home') {
        //    return $state.go('error');
        //} else {
        //    return $state.go('home');
        //}

    });
}