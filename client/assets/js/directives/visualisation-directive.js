'use strict';

var crsVisualisations = angular.module('crsVisualisations', [
        'leaflet-directive',
        'restangular'
    ]);

crsVisualisations
    .factory('IJSRestangular', function(Restangular) {
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('http://sybil-api.cambridgeriskframework.com').setRequestSuffix('');
        });
    })
    .factory('ijsRequest', function ( IJSRestangular ) {
        return IJSRestangular.all('');
    })
    .factory('visualisationStatus', function(){
        return {
            count: 0,
            selected: null,
            updateSelected: function(id) {
                this.selected = id;
                console.log('Visualisation status service registered an ID change: ', this.selected);
            },
            error: function(msg) {
                this.status = 'error';
                this.message = msg;
            },
            clear: function() {
                this.status = null;
                this.message = null;
            }
        }
    })
    .filter('geoJsonFilter', function () {
        return function(layers, layerNames) {

            var originalLayerNames = Object.keys(layers);

            angular.forEach(originalLayerNames, function(layerName) {

                if ( layerNames.indexOf(layerName) < 0 ) {
                    console.log(layers[layerName]);
                    delete layers[layerName];
                }

            });

            return layers;

        };
    })
    .controller('crsInfoPanelDirectiveController', function ( $scope, $element, $window, $timeout ) {

        $scope.toggleInfoPanel = function () {
            $scope.infoVisible = !$scope.infoVisible;

            $timeout(function(){
                window.dispatchEvent(new Event('resize'));
            });
        };

        $scope.infoVisible = true;

    })
    .controller('crsVisualisationDirectiveController', function ( $scope, $element, $window, ijsRequest, $timeout, visualisationStatus ) {

        ijsRequest.get( $scope.visualisationUrl ).then(function(_data){
            $scope.visualisationData = _data.originalElement;
            $scope.visualisationDataLoaded = true;
        });

        $scope.toggleVisualisation = function () {

            if ( $scope.visualisationActive ) {
                if ( $scope.visualisationStatus.count > 1 ) {
                    $scope.visualisationActive = false;
                    $scope.visualisationStatus.count--;
                }
            } else {
                if ( $scope.visualisationStatus.count < 3 ) {
                    $scope.visualisationActive = true;
                    $scope.visualisationStatus.count++;
                }
            }


            $timeout(function(){
                window.dispatchEvent(new Event('resize'));
            }, 300);

        };

        $scope.$watch('visualisationStatus', function() {
            console.log('Selected ID has been registered in visualisation: ', $scope.visualisationType , $scope.visualisationStatus.selected);
        }, true);

    })
    .controller('crsDatalistDirectiveController', function ( $scope, $element, $window, visualisationStatus ) {

        $scope.filters = {
            order       :   null,
            search      :   '',
            ascending   :   false,
            selected    :   null
        };

        $scope.log = function (selected) {
            console.log(selected);
        };

        $scope.selectEntry = function ( entryId ) {
            $scope.visualisationStatus.selected = entryId;
        };

        $scope.toggleSortOrder = function (){
            $scope.filters.ascending = !$scope.filters.ascending;
        };

        $scope.loadDatalist = function ( _data ) {


            var originalData = _data;

            for (var key in originalData) {
                if (originalData.hasOwnProperty(key)) {

                    var datalist = originalData[key].nodeattributes;

                    for ( var i = 0; i < datalist.columnarray.length; i++ ) {

                        // Give each header an index so that it can be accessed directly by UI-select
                        datalist.columnarray[i].index = i;

                    }

                    // Turn data list into an array
                    var data = [];
                    //for ( i = 0; i < datalist.data.length; i++ ) {

                    for (var key in datalist.data) {
                        if (datalist.data.hasOwnProperty(key)) {

                            var entry = datalist.data[key];

                            entry.id = key;

                            data.push(entry);

                        }
                    }

                    // Turn style definitions into an array for the legend select dropdown
                    var legend = [];
                    //for ( i = 0; i < datalist.data.length; i++ ) {

                    if (datalist.styledefinition) {
                        for (var key in datalist.styledefinition.nodestyles) {
                            if (datalist.styledefinition.nodestyles.hasOwnProperty(key)) {

                                var style = datalist.styledefinition.nodestyles[key];

                                style.id = key;

                                legend.push(style);

                            }
                        }
                    }

                    angular.extend($scope, {
                        data            : data,
                        legend          : legend,
                        columnheaders   : datalist.columnarray,
                        styledefinition : datalist.styledefinition
                    });

                    console.log($scope);

                }
            }
        };

        $scope.loadDatalist($scope.layerData);

    })
    .controller('crsChartDirectiveController', function ( $scope, $element, $window, visualisationStatus ) {

        // Chart drawing logic goes here
        $scope.loadCharts = function(data) {

            var chartDiv = $element[0],
                containerDiv = $element.parent()[0];

            // Loop through all the
            for (var key in data) {
                if (data.hasOwnProperty(key)) {

                    var chartObject = data[key];

                    console.log(key + " -> " + chartObject);

                    switch (chartObject['type']) {
                        case "BarChart":
                            var chart = new google.visualization.BarChart(chartDiv);
                            break;
                        case "LineChart":
                            var chart = new google.visualization.LineChart(chartDiv);
                            break;
                    }

                    if (chart != undefined) {

                        var chartData = new google.visualization.DataTable(
                            {
                                cols: chartObject.data.cols,
                                rows: chartObject.data.rows
                            }
                        );

                        // Get size of container
                        var containerWidth = containerDiv.offsetWidth,
                            containerHeight = containerDiv.offsetHeight;

                        var chartOptions = {
                            width:      containerWidth,
                            height:     containerHeight,
                            legend:     chartObject.options.legend,
                            title:      chartObject.options.title,
                            series:     chartObject.options.series,
                            curveType:  chartObject.options.curveType,
                            hAxis:      chartObject.options.hAxis,
                            vAxis:      chartObject.options.vAxis
                        };

                        if (chartObject.options.isStacked === "true") {
                            chartOptions.isStacked = true;
                        }

                        if (chartObject.options.lineWidth != undefined) {
                            chartOptions.lineWidth = $data.charts.options.lineWidth;
                        }

                        function drawChart( chartData, chartOptions, containerDiv ) {

                            chartOptions.width = containerDiv.offsetWidth;
                            chartOptions.height = containerDiv.offsetHeight;
                            chart.draw(chartData, chartOptions);

                        }

                        angular.element($window).bind('resize', function () {
                            drawChart( chartData, chartOptions, containerDiv );
                        });

                        angular.element(document).ready(function () {
                            drawChart( chartData, chartOptions, containerDiv );
                        });



                    }

                }
            }
        };

        $scope.loadCharts($scope.chartData);

    })
    .controller('crsGraphDirectiveController', function ( $scope, $element, $window, visualisationStatus ) {

        // Graph drawing logic goes here
        $scope.loadGraphs = function($data) {

            S24.Charts.createForceDirectedGraph('#visualisation', $data.graph1, {
                width: '100%',
                height: 1000
            }, $scope);

            angular.element($window).bind('resize', function () {
                // Resize
            });

            angular.element(document).ready(function () {
                // Resize
            });

        };

        $scope.loadGraphs($scope.graphData);

        $scope.highlightNode = function ( nodeId ) {
            var nodes = d3.selectAll('.node');
            nodes.classed('selected', false);
            d3.select('#node' + nodeId).classed('selected', true);
        };

        $scope.syncNetworkNodes = function () {
            var nodes = d3.selectAll('.node');
            nodes.classed('open', false);
            var companies = $parent.currentData.companies;
            for (var i in companies) {
                if (companies.hasOwnProperty([i])) {
                    var company = companies[i];
                    if (company.class == 'open') {
                        d3.select('#node' + company.hiddenProperties.guid).classed('open', true);
                    }
                }
            }

        };

        $scope.$watch('selected', function() {
            console.log('Selected ID has changed: ', $scope.selected);
            visualisationStatus.updateSelected($scope.selected);

            $scope.visualisationStatus.selected = $scope.selected;

            $scope.highlightNode($scope.visualisationStatus.selected);

        });

        $scope.$watch('visualisationStatus', function() {

            $scope.highlightNode($scope.visualisationStatus.selected);

        }, true);




    })
    .controller('crsMapDirectiveController', [ "$scope", "leafletData", "leafletBoundsHelpers", "$filter", function ( $scope, leafletData, leafletBoundsHelpers, $filter, visualisationStatus ) {
        // Chart drawing logic goes in here
        $scope.loadMaps = function(data) {
            // D3
            d3.selectAll('#map').remove();
            d3.select('.chart').append('div')
                .attr('id', 'map');

            for (var key in data) {
                if (data.hasOwnProperty(key)) {



                    var mapObject = data[key];

                    angular.extend($scope, mapObject);

                    // Set the map bounding box
                    // TODO: Add dynamic bounding box

                    $scope.maxbounds = leafletBoundsHelpers.createBoundsFromArray([
                        [ 85, 180 ],
                        [ -85, -180 ]
                    ]);

                    var center = {};

                    center.zoom     =   mapObject.zoom;
                    center.lat      =   mapObject.center[0];
                    center.lng      =   mapObject.center[1];

                    $scope.center = center;

                    angular.extend($scope, {
                        layers : {}
                    });

                    // Base background layers
                    // TODO: Replace default background layer feature

                    var baselayers = {};

                    // Fix format of layers to match the Leaflet directive
                    for ( var layer in mapObject.backgroundlayers ) {
                        if ( mapObject.backgroundlayers.hasOwnProperty(layer) ) {

                            var thisLayer = mapObject.backgroundlayers[layer];

                            thisLayer.name      =   thisLayer.title         ||      '';
                            thisLayer.type      =   thisLayer.type          ||      'xyz';

                            baselayers['base' + layer] = thisLayer;

                        }
                    }

                    // Add base layers to the scope
                    angular.extend($scope.layers, {
                        baselayers : baselayers
                    });

                    // Overlay layers

                    var overlays = {
                        count: 0
                    };

                    // WMS

                    // Fix format of layers to match the Leaflet directive
                    for ( var wmslayer in mapObject.wmslayers ) {
                        if ( mapObject.wmslayers.hasOwnProperty(wmslayer) ) {

                            var thisWmsLayer = mapObject.wmslayers[wmslayer];

                            thisWmsLayer.name          =   thisWmsLayer.title         ||      '';
                            thisWmsLayer.type          =   thisWmsLayer.type          ||      'wms';
                            thisWmsLayer.url           =   thisWmsLayer.url           ||      '';
                            thisWmsLayer.maxZoom       =   thisWmsLayer.maxzoom       ||      20;
                            thisWmsLayer.minZoom       =   thisWmsLayer.minzoom       ||      1;
                            thisWmsLayer.format        =   thisWmsLayer.format        ||      'image/png';
                            thisWmsLayer.opacity       =   thisWmsLayer.opacity       ||      1;
                            thisWmsLayer.visible       =   (thisWmsLayer.display && thisWmsLayer.display == 'true');

                            if ( typeof(thisWmsLayer.layerParams) == 'undefined' ) {

                                thisWmsLayer.layerParams   =   {
                                    layers          :   thisWmsLayer.layers            ||      '',
                                    format          :   thisWmsLayer.format            ||      'image/png',
                                    transparent     :   (thisWmsLayer.transparent && thisWmsLayer.transparent == 'true'),
                                    styles          :   thisWmsLayer.styles            ||      ''
                                };

                            }

                            overlays['wms' + wmslayer] = thisWmsLayer;
                            overlays.count++;
                        }
                    }

                    // Primary layers

                    var geojson = {};
                    $scope.visibleLayers = [];

                    // Fix format of layers to match the Leaflet directive
                    for ( var primarylayer in mapObject.primarylayers ) {

                        if ( mapObject.primarylayers.hasOwnProperty(primarylayer) ) {

                            var thisPrimaryLayer = mapObject.primarylayers[primarylayer];

                            if ( typeof(thisPrimaryLayer.geojson) != 'undefined' ) {

                                if ( typeof(thisPrimaryLayer.geojson.features) != 'undefined' ) {

                                    var layerName = 'geojson' + primarylayer;

                                    // Assign each feature to a layer
                                    for ( var i = 0; i < thisPrimaryLayer.geojson.features.length; i++ ) {
                                        thisPrimaryLayer.geojson.features[i].layer = layerName;
                                    }

                                    thisPrimaryLayer.geojson.layer = layerName;

                                    var thisGeoJSON = {
                                        data: thisPrimaryLayer.geojson,
                                        style: function (feature) {

                                            // Check what kind of shape this is
                                            if ( typeof(feature.properties.nodestyle) != 'undefined' ) {

                                                // Apply node styles
                                                var styles = mapObject.styledefinition.nodestyles[feature.properties.nodestyle] || {};
                                                styles.opacity = 1;
                                                styles.fillOpacity = 1;
                                                styles.stroke = 0;

                                                return styles;

                                            } else if ( typeof(feature.properties.linkstyle) != 'undefined' ) {

                                                // Apply link styles
                                                var styles = mapObject.styledefinition.linkstyles[feature.properties.linkstyle] || {};
                                                styles.opacity = 0.2;
                                                styles.weight = 1;

                                                return styles;

                                            }

                                        },
                                        pointToLayer: function (feature, latlng) {

                                            var marker = new L.CircleMarker(latlng, {radius: feature.properties.size * 3, fillOpacity: 0.85});

                                            feature.layer = layerName;

                                            if (feature.properties.title !== undefined) {
                                                marker.bindLabel('<span style="color:' + newProperties.titleColor + '">' + feature.properties.title + '</span>', { noHide: true });
                                            }

                                            marker.on('click', function(e) {

                                                feature.properties.hide = true;

                                            });

                                            return marker;

                                        },
                                        layer: layerName,
                                        type: 'geoJSON'
                                    };
                                    geojson[layerName] = thisGeoJSON;

                                    //overlays[layerName] = {
                                    //    name            : thisPrimaryLayer.title,
                                    //    type            : 'group',
                                    //    visible         : true
                                    //};
                                    //overlays.count++;

                                    $scope.visibleLayers.push(layerName);
                                }
                            }
                        }
                    }
                    angular.extend($scope, {
                        geojson : geojson
                    });






                    // Overlay WMS layers
                    if ( overlays.count > 0 ) {
                        // Add overlays to the scope
                        angular.extend($scope.layers, {
                            overlays : overlays
                        });
                    }

                    leafletData.getMap('leafletmap').then(function(map) {
                        //Access the map object
                        $scope.map = map;

                        map.on('overlayadd overlayremove', function (event, layer) {
                            // An overlay has been toggled. Refresh the geoJSON layers

                            // TODO: Make this work properly

                            $scope.$apply(function(){
                                $scope.visibleLayers = ["geojson20"];
                                $scope.geojson = $filter('geoJsonFilter')($scope.geojson, $scope.visibleLayers);
                            });

                            $scope.geojson = $filter('geoJsonFilter')($scope.geojson, $scope.visibleLayers);

                        });

                    });

                    $scope.$on("leafletDirectiveMap.geojsonMouseover", function(ev, feature, leafletEvent) {
                        var layer = leafletEvent.target;
                        console.log(feature.id + ' hovered');
                    });

                    $scope.$on("leafletDirectiveMap.geojsonClick", function(ev, feature, leafletEvent) {
                        var layer = leafletEvent.target;
                        layer.bringToFront();
                        console.log(feature.id + ' clicked', feature);

                        $scope.visualisationStatus.selected = feature.id;

                    });

                    $scope.$watch('visualisationStatus', function() {

                        $scope.highlightNode($scope.visualisationStatus.selected);

                    }, true);

                }
            }
        };

        $scope.loadMaps($scope.mapData);

        $scope.syncMapNodes = function () {
            var allMarkers = $scope.allMapMarkers;
            var map = $scope.getGuidToIdMap();
            for (var key in allMarkers) {
                if (allMarkers.hasOwnProperty(key)) {
                    var id = allMarkers[key]._id;
                    var className = $parent.currentData.companies[map[id]].class;
                    allMarkers[key]._container.setAttribute('class', className);
                    allMarkers[key]._path.removeAttribute('stroke');
                    if (className == 'open') {
                        // remove/add to DOM to repaint on top
                        var parent = allMarkers[key]._container.parentNode;
                        var tmpContainer = allMarkers[key]._container;
                        parent.removeChild(tmpContainer);
                        parent.appendChild(tmpContainer);
                    }
                }
            }
        };

        $scope.highlightNode = function ( nodeId ) {

                //console.log(map);
                ////Access the map object
                //var feature = $scope.geojson.getLayer(nodeId);
                //console.log(feature);

        };

    }])
    .directive('crsInfoPanel', function() {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'directives/info-panel.html',
            scope: {
                info    : '='
            },
            controller: 'crsInfoPanelDirectiveController'
        };
    })
    .directive('crsVisualisation', function() {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'directives/visualisation.html',
            scope: {
                visualisationUrl    : '=',
                visualisationType   : '=',
                visualisationActive : '=',
                visualisationStatus: '='
            },
            controller: 'crsVisualisationDirectiveController'
        };
    })
    .directive('crsDatalist', function() {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'directives/datalist.html',
            scope: {
                layerData: '=',
                visualisationStatus: '='
            },
            controller: 'crsDatalistDirectiveController'
        };
    })
    .directive('crsMap', function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/map.html',
            scope: {
                mapData: '=',
                visualisationStatus: '='
            },
            controller: 'crsMapDirectiveController'
        };
    })
    .directive('crsGraph', function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/graph.html',
            scope: {
                graphData: '=',
                visualisationStatus: '='
            },
            controller: 'crsGraphDirectiveController'
        };
    })
    .directive('crsChart', function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/chart.html',
            scope: {
                chartData: '=',
                visualisationStatus: '='
            },
            controller: 'crsChartDirectiveController'
        };
    });