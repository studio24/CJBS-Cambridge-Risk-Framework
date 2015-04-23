angular.module('crfVisualisations', [])
    .controller('crfVisualisationDirectiveController', function ( $scope, ijsRequest ) {

        var visualisationPromise = ijsRequest.get( $scope.visualisationUrl).then(function(response){

            $scope.visualisation = response;

            console.log( 'Visualisation added to isolated directive scope:', $scope.visualisation );

            $scope.loadCharts($scope.visualisation);

        });

        // Chart drawing logic goes here
        $scope.loadCharts = function($data) {

            var chartDiv = document.getElementByClassName('visualisation');

            switch ($data.modules.charts.options.type) {
                case "BarChart":
                    var chart = new google.visualization.BarChart(chartDiv);
                    break;
                case "LineChart":
                    var chart = new google.visualization.LineChart(chartDiv);
                    break;
            }

            if (chart != undefined) {
                // @todo fix chart drawing, go through and fix all data from JSON object
                var chartData = new google.visualization.DataTable(
                    {
                        cols: $data.charts.data.cols,
                        rows: $data.charts.data.rows
                    }
                );

                // Get size of container
                var containerWidth = document.getElementById('data-area').offsetWidth;
                var containerHeight = document.getElementById('data-area').offsetHeight;

                var chartOptions = {
                    width: containerWidth,
                    height: containerHeight,
                    legend: $data.charts.options.legend,
                    title: $data.charts.options.title,
                    series: $data.charts.options.series,
                    curveType: $data.charts.options.curveType,
                    hAxis: $data.charts.options.hAxis,
                    vAxis: $data.charts.options.vAxis
                };

                if ($data.charts.options.isStacked === "true") {
                    chartOptions.isStacked = true;
                }

                if ($data.charts.options.lineWidth != undefined) {
                    chartOptions.lineWidth = $data.charts.options.lineWidth;
                }

                chart.draw(chartData, chartOptions);
            }
        };
    })
    .directive('crfVisualisation', function() {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'templates/visualisation.html',
            scope: {
                visualisationUrl: '@url'
            },
            controller: 'crfVisualisationDirectiveController'
        };
    });