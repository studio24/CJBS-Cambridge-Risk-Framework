angular.module('crfVisualisations', [])
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

        // Chart drawing logic goes in here
        $scope.loadMaps = function(data) {
            // D3
            d3.selectAll('#map').remove();
            d3.select('.chart').append('div')
                .attr('id', 'map');

            for (var key in data) {
                if (data.hasOwnProperty(key)) {

                    var mapObject = data[key];

                    // Base background layers
                    var baseLayers = {};
                    if (mapObject.backgroundlayers.defaultbackgroundlayer != undefined) {
                        var defaultBaseLayer = mapObject.backgroundlayers.defaultbackgroundlayer;
                    } else {
                        var defaultBaseLayer = 0;
                    }
                    for (var property in mapObject.backgroundlayers) {
                        if (mapObject.backgroundlayers.hasOwnProperty(property)) {

                            var backgroundLayer = mapObject.backgroundlayers[property];

                            // Set options
                            var options = {
                                maxZoom: 12,
                                minZoom: 2
                            };
                            if (backgroundLayer.maxzoom != undefined) {
                                options.maxZoom = backgroundLayer.maxzoom;
                            }
                            if (backgroundLayer.minzoom != undefined) {
                                options.minZoom = backgroundLayer.minzoom;
                            }
                            if (backgroundLayer.attribution != undefined) {
                                options.attribution = backgroundLayer.attribution;
                            }

                            var newTile = L.tileLayer(backgroundLayer.url, options);
                            baseLayers[backgroundLayer.title] = newTile;

                            // Set default background layer
                            if (property == defaultBaseLayer) {
                                var defaultMap = newTile;
                            }
                        }
                    }

                    // Set the map bounding box
                    var southWest = L.latLng(-85, -180),
                        northEast = L.latLng(85, 180),
                        bounds = L.latLngBounds(southWest, northEast);

                    // Create the leaflet map
                    $scope.map = L.map('visualisation', {
                        layers: [defaultMap],
                        keyboard: false,
                        maxBounds: bounds
                    }).setView(mapObject.center, mapObject.zoom);

                    // WMS overlay layers
                    var overlayLayers = {};
                    if (typeof(mapObject.wmsLayers) != 'undefined') {

                        for (var property in mapObject.wmsLayers) {
                            if (mapObject.wmsLayers.hasOwnProperty(property)) {

                                var wmsLayer = mapObject.wmsLayers[property];

                                // Set options
                                var options = {
                                    'layers': wmsLayer.layers
                                };
                                if (wmsLayer.maxzoom != undefined) {
                                    options.maxZoom = wmsLayer.maxzoom;
                                }
                                if (wmsLayer.minzoom != undefined) {
                                    options.minZoom = wmsLayer.minzoom;
                                }
                                if (wmsLayer.attribution != undefined) {
                                    options.attribution = wmsLayer.attribution;
                                }
                                if (wmsLayer.format != undefined) {
                                    options.format = wmsLayer.format;
                                }
                                if (wmsLayer.opacity != undefined) {
                                    options.opacity = wmsLayer.opacity;
                                }
                                if (wmsLayer.styles != undefined) {
                                    options.styles = wmsLayer.styles;
                                }
                                if (wmsLayer.transparent != undefined) {
                                    options.transparent = (wmsLayer.transparent === "true");
                                }
                                if (wmsLayer.zindex != undefined) {
                                    options.zIndex = wmsLayer.zindex;
                                }

                                // Setup the WMS layer
                                var wmsTile = L.tileLayer.wms(wmsLayer.url, options);
                                overlayLayers[wmsLayer.title] = wmsTile;

                                // Add to map by default?
                                if (wmsLayer.display === "true") {
                                    wmsTile.addTo($scope.map);
                                }

                            }
                        }
                    }


                    // Disable zoom on double-click
                    $scope.map.doubleClickZoom.disable();

                    // Loop through all layer data from the JSON file
                    for (var primaryLayer in mapObject.primaryLayers) {
                        if (mapObject.primaryLayers.hasOwnProperty(primaryLayer)) {
                            var layer = L.geoJson();

                            var primaryLayer = mapObject.primaryLayers[primaryLayer];

                            // Loop through each feature in the layer
                            primaryLayer.geojson.features.forEach(function(feature) {
                                var newProperties;

                                // Check if the feature is a node, or a link
                                if (typeof(feature.properties.nodestyle) != 'undefined') {
                                    newProperties = mapObject.nodeStyles[feature.properties.nodestyle] || {};
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
                                    newProperties = mapObject.linkStyles[feature.properties.linkstyle] || {};
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
                            overlayLayers[primaryLayer.title] = nodesLayer;


                        }
                    }

                    // Add layer controls
                    L.control.layers(baseLayers, overlayLayers).addTo($scope.map);

                }
            };
        };

        switch ( $scope.visualisationType ) {

            case 'charts' :
                $scope.loadCharts( $scope.visualisationData );
                break;

            case 'graphs' :
                $scope.loadGraphs( $scope.visualisationData );
                break;

            case 'maps' :
                $scope.loadMaps( $scope.visualisationData );
                break;

        }
    })
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
    });