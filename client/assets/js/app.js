'use strict';

var app = angular.module('application', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',

    'restangular'
    ])
    .config(config)
    .run(run)
;

app.$inject = ['FoundationApi'];
app.$inject = ['Hammer'];

config.$inject = ['$urlRouterProvider', '$locationProvider', '$stateProvider', 'RestangularProvider'];

function config($urlProvider, $locationProvider, $stateProvider, RestangularProvider) {

    RestangularProvider.setBaseUrl('http://sybil-api.cambridgeriskframework.com/api/');

    $stateProvider
        .state('home', {
            resolve     : {
                projectList: [ 'projects', function( projects ) {

                    // Get the full list of projects before the controller runs.
                    return projects.getList();

                }]
            },
            url: '/',
            templateUrl : 'templates/home.html',
            controller  : 'crfProjectListController',
            animation   : {
                enter   : 'slideInRight',
                leave   : 'slideOutRight'
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
            url         : '/:projectId',
            templateUrl : 'templates/project.html',
            controller  : 'crfProjectController',
            animation   : {
                enter   : 'slideInRight',
                leave   : 'slideOutRight'
            }
        })
        .state('project.section', {
            resolve     : {
                section: [ '$stateParams', '$filter', 'sections', 'project', function( $stateParams, $filter, sections, project ) {

                    var sectionNumber = $stateParams.sectionNumber;

                    // We have the section number, not the ID, so we need to Loop through the sections in the current project to find the appropriate ID.
                    var sectionOverview = $filter('getByAttr')( project.sections, 'sectionnumber', sectionNumber );

                    // Now we have the section object in the parent project, so we can look up the section by ID before the controller runs.
                    var sectionId = sectionOverview.id;
                    return sections.get( sectionId );

                }]
            },
            url: '/:sectionNumber',
            animation   : {
                enter: 'slideInRight',
                leave: 'slideOutRight'
            },
            views       : {
                "phase-navigation@project": {
                    templateUrl: 'templates/phase-navigation.html',
                    controller: 'crfSectionController'
                }
            }
        })
        .state('project.section.phase', {
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
            url: '/:phaseNumber',
            animation   : {
                enter   : 'slideInRight',
                leave   : 'slideOutRight'
            },
            views: {
                "content@project": {
                    templateUrl: 'templates/content.html',
                    controller: 'crfPhaseController'
                }
            }
        })
        .state('settings', {
            url: '/settings',
            templateUrl : 'templates/settings.html',
            animation   : {
                enter   : 'slideInRight',
                leave   : 'slideOutRight'
            }
        });

        $urlProvider.otherwise('/');

        $locationProvider.html5Mode({
            enabled: false,
            requireBase: false
        });

        $locationProvider.hashPrefix('!');
    }

function run($rootScope) {
    FastClick.attach(document.body);

    // Report errors in state transitions
    $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {

        console.log('Error on StateChange from: "' + (fromState && fromState.name) + '" to:  "'+ toState.name + '", err:' + error.message + ", code: " + error.status);

        if(error.status === 401) { // Unauthorized

            $state.go('signin.content');

        } else if (error.status === 503) {
            // the backend is down for maintenance, we stay on the page
            // a message is shown to the user automatically by the error interceptor
            event.preventDefault();
        } else {

            $rootScope.$emit('clientmsg:error', error);
            console.log('Stack: ' + error.stack);

            // check if we tried to go to a home state, then we cannot redirect again to the same
            // homestate, because that would lead to a loop
            if (toState.name === 'home') {
                return $state.go('error');
            } else {
                return $state.go('home');
            }

        }

    });
}