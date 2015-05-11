angular.module('crfVisualisations', ["leaflet-directive"])
    .controller('crfVisualisationDirectiveController', function ( $scope, $element, $window ) {


        // Graph drawing logic goes here
        $scope.loadGraphs = function($data) {

            S24.Charts.createForceDirectedGraph('#visualisation', $data.graph1, {
                width: '100%',
                height: 1000
            }, $scope);

            angular.element($window).bind('resize', function () {
                // Resize
            });

        };

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

                        drawChart( chartData, chartOptions, containerDiv )

                        angular.element($window).bind('resize', function () {
                            drawChart( chartData, chartOptions, containerDiv )
                        });

                    }

                }
            }
        };



        switch ( $scope.visualisationType ) {

            case 'charts' :
                $scope.loadCharts( $scope.visualisationData );
                break;

            case 'graphs' :
                $scope.loadGraphs( $scope.visualisationData );
                break;

            case 'maps' :
                $scope.map = true;
                break;

        }
    })
    .controller('crfMapDirectiveController', [ "$scope", "leafletData", "leafletBoundsHelpers", function ( $scope, leafletData, leafletBoundsHelpers ) {
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



                    // Overlay layers



                    if ( overlays.count > 0 ) {
                        // Add overlays to the scope
                        angular.extend($scope.layers, {
                            overlays : overlays
                        });
                    }

                    // Overlay layers
                    var overlayLayers = {};

                    leafletData.getMap('map').then(function(map) {

                        $scope.map = map;

                        // Fix format of primary layers to match the Leaflet directive
                        for ( var primarylayer in mapObject.primarylayers ) {

                            if ( mapObject.primarylayers.hasOwnProperty(primarylayer) ) {

                                var layer = L.geoJson();

                                var thisPrimaryLayer = mapObject.primarylayers[primarylayer];

                                thisPrimaryLayer.geojson.features.forEach(function(feature) {
                                    var newProperties;

                                    // Check if the feature is a node, or a link
                                    if (typeof(feature.properties.nodestyle) != 'undefined') {
                                        newProperties = mapObject.styledefinition.nodestyles[feature.properties.nodestyle] || {};
                                        newProperties.opacity = 1;
                                        newProperties.fillOpacity = 1;
                                        newProperties.stroke = 0;

                                        // Add the feature to the map
                                        var marker;
                                        var guid = feature.id;
                                        L.geoJson(feature, {
                                            style: newProperties,
                                            pointToLayer: function(feature, latlng) {
                                                marker = new L.CircleMarker(latlng, {radius: feature.properties.size * 3, fillOpacity: 0.85});
                                                marker._id = 'guid' + guid;
                                                marker.on('click', function(e) {
                                                    var markerId = e.target._id;
                                                    $scope.$apply(function() {
                                                        $scope.toggleCompanyById(markerId);
                                                    });
                                                });
                                                $scope.allMapMarkers = $scope.allMapMarkers || [];
                                                $scope.allMapMarkers.push(marker);
                                                if (feature.properties.title !== undefined) {
                                                    marker.bindLabel('<span style="color:' + newProperties.titleColor + '">' + feature.properties.title + '</span>', { noHide: true });
                                                }
                                                return marker;
                                            }
                                        }).addTo(layer);
                                    } else {
                                        newProperties = mapObject.styledefinition.linkstyles[feature.properties.linkstyle] || {};
                                        newProperties.opacity = 0.2;
                                        newProperties.weight = 1;
                                        // Add the feature to the map
                                        L.geoJson(feature, {
                                            style: newProperties
                                        }).addTo(layer);
                                    }

                                });

                                var nodesLayer = L.layerGroup([layer]).addTo($scope.map);

                                // Add layer controls
                                overlayLayers[primarylayer.title] = nodesLayer;
                            }
                        }

                        //// Add layer controls
                        //L.control.layers(overlayLayers).addTo($scope.map);

                    });





                }
            }
        };



        $scope.loadMaps( $scope.data );

    }])
    .directive('crfVisualisation', function() {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'directives/visualisation.html',
            scope: {
                visualisationData: '=',
                visualisationType: '='
            },
            controller: 'crfVisualisationDirectiveController'
        };
    })
    .directive('crfMap', function() {
        return {
            restrict: 'AE',
            templateUrl: 'directives/map.html',
            scope: {
                data: '='
            },
            controller: 'crfMapDirectiveController'
        };
    })
    .directive('crfVisualisationLayers', function() {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'directives/visualisation.html',
            scope: {
                visualisationData: '=',
                visualisationType: '='
            },
            controller: 'crfVisualisationDirectiveController'
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