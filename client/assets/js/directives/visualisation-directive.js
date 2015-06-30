'use strict';

var crsVisualisations = angular.module('crsVisualisations', [
        'leaflet-directive',
        'restangular'
    ]);

crsVisualisations
    .factory('IJSRestangular', function(Restangular, utilsService) {
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('http://sybil-api.cambridgeriskframework.com').setRequestSuffix('');
            RestangularConfigurer.setResponseExtractor(function(response) {
                var newResponse = response.originalElement;

                // The JSON has been accessed successfully but if there is an error from the server, we need to display it.
                if (newResponse.error) {

                    var errorMessage = function () {
                        if (newResponse.timestamp) {
                            return newResponse.error + '. ' +
                                'Error logged at ' + newResponse.timestamp;
                        } else {
                            return newResponse.error;
                        }
                    };

                    utilsService.notify({
                        title       : 'Visualisation URL error',
                        color       : 'error',
                        content     : errorMessage()
                    });
                }
                return response;
            });
            RestangularConfigurer.setErrorInterceptor(function(response, deferred, responseHandler) {

                // The JSON could not be accessed. Notify the user with a standard error message.
                var responseTitle = function () {
                    if (response.status && response.status != 0) {
                        return 'Visualisation connection error ' + response.status;
                    } else {
                        return 'Unknown visualisation connection error';
                    }
                };

                var responseText = function () {
                    if (response.statusText && response.statusText != '') {
                        return response.statusText;
                    } else {
                        return '';
                    }
                };

                utilsService.notify({
                    title       : responseTitle,
                    color       : 'error',
                    content     : 'Could not retrieve visualisation data from ' + response.config.url + '. ' + responseText()
                });
                return true;
            });
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

    })
    .controller('crsDatalistDirectiveController', function ( $scope, $element, $window, visualisationStatus ) {

        $scope.filters = {
            order       :   null,
            search      :   '',
            ascending   :   false,
            selected    :   null
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

                }
            }
        };

        $scope.loadDatalist($scope.layerData);

        $scope.$watch('visualisationStatus', function() {

            if ($scope.visualisationStatus.selected) {

                var $selectedEntry = angular.element('#entry-' + $scope.visualisationStatus.selected);

                if ($selectedEntry.length > 0) {

                    var $recordList = angular.element('#data-record-list');

                    var selectedEntryPosition = $selectedEntry.position().top + $recordList[0].scrollTop - ($recordList.height() / 2) + $selectedEntry.height();

                    $recordList.animate({scrollTop: selectedEntryPosition}, 300);

                }

            }

        }, true);

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

            var container = '#visualisation';
            var dataset = $data.graph1;
            var width = d3.select(container)[0][0].clientWidth,
                height = 800;

            // Setup the required variables
            var links = [];
            var nodes = dataset.data.graphdump.nodes.slice();
            var bilinks = [];

            var forceScale = d3
                .scale
                .linear()
                .domain([2*d3.min(nodes, function(d) { return d.weight || 1 }), 2*d3.max(nodes, function(d) { return d.weight || 1 })])
                .range([-30,10]);

            // Setup force simulation
            var force = d3.layout.force()
                .linkDistance(function (d) {
                    return (d.target.size || 1) + (d.source.size || 1);
                })
                .linkStrength(2)
                .charge(function(d, i) {
                    return forceScale(d.weight);
                })
                .size([width, height]);

            var svgContainer;

            var zoomed = function() {
                svgContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            };

            var zoom = d3.behavior.zoom()
                .scaleExtent([0.5, 8])
                .on("zoom", zoomed);

            var svg = d3.select(container).append('svg')
                .attr('height', height)
                .attr('width', '100%')
                .call(zoom);

            svgContainer = svg.append('g');

            // Loop through the dataset and construct the nodes and links
            dataset.data.graphdump.links.forEach(function(link) {
                var s = nodes[link.source],
                    t = nodes[link.target],
                    i = {};
                var opacity = 0.01 * (link.weight / 50);
                var style = dataset.styledefinition.linkstyles[link.linkstyle];

                nodes.push(i);
                links.push({source: s, target: i}, {source: i, target: t});
                bilinks.push([s, i, t, {
                    'opacity': opacity,
                    'style': style
                }]);
            });

            // Loop through nodes and get their style definition
            nodes.forEach(function(node) {
                node.style = dataset.styledefinition.nodestyles[node.nodestyle];

                if ( dataset.parameters.algorithm != 'd3_force_directed' ) {
                    node.fixed = true;
                }

            });

            // Start the force directed graph
            force.nodes(nodes)
                .links(links)
                .start();

            // Create the links
            var link = svgContainer.selectAll('.link')
                .data(bilinks)
                .enter().append('path')
                .attr('class', 'link')
                .attr('stroke', function(d) {
                    if (typeof(d[3].style) != 'undefined') {
                        return d[3].style.color;
                    } else {
                        return '#ffffff';
                    }
                })
                .attr('opacity', function(d) {
                    return d[3].opacity;
                });

            // Create the blank node
            var node = svgContainer.selectAll('.node')
                .data(dataset.data.graphdump.nodes)
                .enter().append('g')
                .attr('class', 'node')
                .attr('id', function (d) {
                    return 'node' + d.guid;
                });
            node.append('text')
                .text(function (d) {
                    return d.title;
                })
                .attr('fill', function (d) {
                    return d.style.titleColor;
                })
                .attr('transform', function (d) {
                    var left = -1 * this.getBoundingClientRect().width / 2;
                    var bottomPaddingFromNode = 3;
                    var top = d.size * 3 + this.getBoundingClientRect().height + bottomPaddingFromNode;
                    return 'translate(' + left + ',' + top + ')';
                });
            node.append('circle')
                .attr('fill', function(d) {
                    if (typeof(d.style) != 'undefined') {
                        return d.style.fillColor;
                    } else {
                        return '#ffffff';
                    }
                })
                .attr('r', function (d) { return 3 * d.size; });
            node.on('click', function(d, i) {
                $scope.$apply(function() {
                    $scope.visualisationStatus.selected = d.guid;
                });
            });

            // Move around the link and nodes on each tick
            force.on('tick', function() {
                link.attr('d', function(d) {
                    return "M" + d[0].x + "," + d[0].y
                        + " S" + (d[1].x) + "," + (d[1].y)
                        + " " + d[2].x + "," + d[2].y;
                });
                node.attr('transform', function(d) {
                    return 'translate(' + d.x + ',' + d.y + ')';
                });
            });

            angular.element($window).bind('resize', function () {
                // Resize
            });

            angular.element(document).ready(function () {
                // Resize
            });

        };

        $scope.loadGraphs($scope.graphData);

        $scope.highlightNode = function ( nodeId ) {
            var nodes = d3.selectAll('.graphs .node');
            nodes.classed('selected', false);
            d3.select('#node' + nodeId).classed('selected', true);
        };

        $scope.$watch('visualisationStatus', function() {

            $scope.highlightNode($scope.visualisationStatus.selected);

        }, true);




    })
    .controller('crsMapDirectiveController', [ "$scope", "leafletData", "leafletBoundsHelpers", "$filter", function ( $scope, leafletData, leafletBoundsHelpers, $filter, visualisationStatus ) {

        $scope.markerMap = {}; //a global variable unless you extend L.GeoJSON

        //Add the marker id as a data item (called "data-artId") to the "a" element
        function addToList(data) {
            for (var i = 0; i < data.features.length; i++) {
                var art = data.features[i];
                $('div#infoContainer').append('<a href="#" class="list-link" data-artId=\"'+art.id+'\" title="' + art.properties.descfin + '"><div class="info-list-item">' + '<div class="info-list-txt">' + '<div class="title">' + art.properties.wrknm + '</div>' + '<br />' + art.properties.location + '</div>' + '<div class="info-list-img">' + art.properties.img_src + '</div>' + '<br />' + '</div></a>')
            }
            $('a.list-link').click(function (e) {
                alert('now you see what happens when you click a list item!');

                //Get the id of the element clicked
                var artId = $(this).data( 'artId' );
                var marker = markerMap[artId];

                //since you're using CircleMarkers the OpenPopup method requires
                //a latlng so I'll just use the center of the circle
                marker.openPopup(marker.getLatLng());
                e.preventDefault()
            })
        }

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

                    center.zoom     =   mapObject.zoom || 2;
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

                                            } else if ( typeof(feature.properties.linkstyle) != 'undefined' ) {

                                                // Apply link styles
                                                var styles = mapObject.styledefinition.linkstyles[feature.properties.linkstyle] || {};
                                                styles.opacity = 0.2;
                                                styles.weight = 1;

                                            }

                                            styles.className = 'node node-' + feature.id;

                                            if ($scope.visualisationStatus.selected && feature.id == $scope.visualisationStatus.selected) {
                                                styles.className += ' selected';
                                            }

                                            return styles;

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

                                            $scope.markerMap[feature.id] = marker;

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

                        $scope.map.on('overlayadd overlayremove', function (event, layer) {
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
                    });

                    $scope.$on("leafletDirectiveMap.geojsonClick", function(ev, feature, leafletEvent) {
                        var layer = leafletEvent.target;
                        layer.bringToFront();

                        $scope.visualisationStatus.selected = feature.id;

                    });

                    $scope.$watch('visualisationStatus', function() {

                        $scope.highlightNode($scope.visualisationStatus.selected);

                    }, true);

                }
            }
        };

        $scope.loadMaps($scope.mapData);

        $scope.highlightNode = function ( nodeId ) {
            var nodes = d3.selectAll('.maps .node');
            nodes.classed('selected', false);

            if (nodeId) {
                d3.select('.node-' + nodeId).classed('selected', true);

                var selectedMarker = $scope.markerMap[nodeId];

                if (selectedMarker) {

                    selectedMarker.bringToFront();

                    var newZoomLevel = 3;

                    if ($scope.center.zoom > newZoomLevel) {
                        newZoomLevel = $scope.center.zoom;
                    }

                    $scope.map.setView(selectedMarker.getLatLng(), newZoomLevel, {animate: true});
                }
            }
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