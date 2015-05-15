angular.module('crsVisualisations', ["leaflet-directive"])
    .controller('crsVisualisationDirectiveController', function ( $scope, $element, $window ) {

        // Nothing here yet

    })
    .controller('crsDatalistDirectiveController', function ( $scope, $element, $window ) {

        $scope.selectEntry = function ( entryId ) {
            $scope.selected = entryId;
        };

        $scope.toggleSortOrder = function (){
            $scope.ascending = !$scope.ascending;
        };

        $scope.loadDatalist = function ( data ) {

            for (var key in data) {
                if (data.hasOwnProperty(key)) {

                    var datalist = data[key].nodeattributes;

                    var iterator = 0;
                    for ( var key in datalist.columnlist ) {
                        if ( datalist.columnlist.hasOwnProperty(key) ) {

                            if ( datalist.columnlist[key].show && !$scope.visibleField) {
                                $scope.visibleField = iterator;
                            }
                            iterator++;
                        }
                    }


                    var data = [];
                    //for ( i = 0; i < datalist.data.length; i++ ) {

                    var filters = [];

                    for (var key in datalist.data) {
                        if (datalist.data.hasOwnProperty(key)) {

                            var entry = datalist.data[key];

                            entry.id = key;

                            for ( ii = 0; ii < entry.fields.length; ii++ ) {

                                //var columnheader = columnlist[ii];

                                //if ( datalist.styledefinition.nodestyles[entry.style].legendLabel == entry.fields[ii] ) {
                                //    filters
                                //};

                                //entry.fields[ columnheader.id ] = entry.fields[ii];
                                //delete entry.fields[ii];
                                //entry.styles = columnheader.style;

                            }

                            data.push(entry);

                        }
                    }

                    angular.extend($scope, {
                        data: data,
                        columnheaders: datalist.columnarray,
                        styledefinition: datalist.styledefinition
                    });

                    console.log($scope);

                }
            }
        };

        $scope.loadDatalist( $scope.layerData );


    })
    .controller('crsChartDirectiveController', function ( $scope, $element, $window ) {

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

        $scope.loadCharts( $scope.chartData );

    })
    .controller('crsGraphDirectiveController', function ( $scope, $element, $window ) {

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
                drawChart( chartData, chartOptions, containerDiv );
            });

        };

        $scope.loadGraphs( $scope.graphData );

    })
    .controller('crsMapDirectiveController', [ "$scope", "leafletData", "leafletBoundsHelpers", function ( $scope, leafletData, leafletBoundsHelpers ) {
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

                    // Fix format of layers to match the Leaflet directive
                    for ( var primarylayer in mapObject.primarylayers ) {

                        if ( mapObject.primarylayers.hasOwnProperty(primarylayer) ) {

                            var thisPrimaryLayer = mapObject.primarylayers[primarylayer];

                            if ( typeof(thisPrimaryLayer.geojson) != 'undefined' ) {

                                if ( typeof(thisPrimaryLayer.geojson.features) != 'undefined' ) {

                                    var layerName = 'geojson' + primarylayer;

                                    // Assign each feature to a layer
                                    for ( i = 0; i < thisPrimaryLayer.geojson.features.length; i++ ) {
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

                                            marker = new L.CircleMarker(latlng, {radius: feature.properties.size * 3, fillOpacity: 0.85});

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
                                        type: 'geoJSON',
                                        filter: function (feature) {
                                            if ( feature.properties.hide ) {
                                                return false;
                                            } else {
                                                var layerName = feature.layer;

                                                if ( typeof(layerName) != 'undefined' ) {
                                                    var associatedLayer = $scope.layers.overlays[layerName];
                                                    if ( typeof(associatedLayer) != 'undefined' ) {
                                                        return associatedLayer.visible;
                                                    }
                                                }
                                                return true;
                                            }
                                        }
                                    };
                                    geojson[layerName] = thisGeoJSON;

                                    overlays[layerName] = {
                                        name: thisPrimaryLayer.title,
                                        type: 'group',
                                        visible: true
                                    };
                                    overlays.count++;
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




                    leafletData.getMap().then(function(map) {
                        //Access the map object

                    });

                    $scope.$on("leafletDirectiveMap.geojsonMouseover", function(ev, feature, leafletEvent) {
                        var layer = leafletEvent.target;
                        console.log(feature.id + ' hovered');
                    });

                    $scope.$on("leafletDirectiveMap.geojsonClick", function(ev, feature, leafletEvent) {
                        var layer = leafletEvent.target;
                        layer.bringToFront();
                        console.log(feature.id + ' clicked', feature);
                    });

                }
            }
        };

        $scope.loadMaps( $scope.mapData );



    }])
    .directive('crsVisualisation', function() {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'directives/visualisation.html',
            scope: {
                visualisationData: '=',
                visualisationType: '='
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
                layerData: '='
            },
            controller: 'crsDatalistDirectiveController'
        };
    })
    .directive('crsMap', function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/map.html',
            scope: {
                mapData: '='
            },
            controller: 'crsMapDirectiveController'
        };
    })
    .directive('crsGraph', function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/graph.html',
            scope: {
                graphData: '='
            },
            controller: 'crsGraphDirectiveController'
        };
    })
    .directive('crsChart', function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/chart.html',
            scope: {
                chartData: '='
            },
            controller: 'crsChartDirectiveController'
        };
    });





















// TODO: Keep an eye on the leaflet directive project and update to use this code when a vector or GeoJSON layer is added
//if ( typeof(thisPrimaryLayer.geojson) != 'undefined' ) {
//
//    if ( typeof(thisPrimaryLayer.geojson.features) != 'undefined' ) {
//
//        thisPrimaryLayer.geojson.name = "GeoJSON data";
//
//        var layerName = 'geojson' + primarylayer;
//
//        thisGeoJSON = {
//            data: thisPrimaryLayer.geojson,
//            style: function (feature) {
//
//                // Check what kind of shape this is
//                if ( typeof(feature.properties.nodestyle) != 'undefined' ) {
//
//                    // Apply node styles
//                    var styles = mapObject.styledefinition.nodestyles[feature.properties.nodestyle] || {};
//                    styles.opacity = 1;
//                    styles.fillOpacity = 1;
//                    styles.stroke = 0;
//
//                    return styles;
//
//                } else if ( typeof(feature.properties.linkstyle) != 'undefined' ) {
//
//                    // Apply link styles
//                    var styles = mapObject.styledefinition.linkstyles[feature.properties.linkstyle] || {};
//                    styles.opacity = 0.2;
//                    styles.weight = 1;
//
//                    return styles;
//
//                }
//
//            },
//            pointToLayer: function (feature, latlng) {
//
//                marker = new L.CircleMarker(latlng, {radius: feature.properties.size * 3, fillOpacity: 0.85});
//
//                feature.layer = layerName;
//
//                if (feature.properties.title !== undefined) {
//                    marker.bindLabel('<span style="color:' + newProperties.titleColor + '">' + feature.properties.title + '</span>', { noHide: true });
//                }
//
//                //marker.on('click', function(e) {
//                //
//                //    var markerId = e.target._id;
//                //
//                //    $scope.$apply(function() {
//                //        $scope.toggleCompanyById(markerId);
//                //    });
//                //
//                //});
//
//                return marker;
//
//            }
//        };
//
//
//
//    }
//}