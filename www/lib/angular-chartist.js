(function () {
    var angularChartist = angular.module('angular-chartist', []);

    angularChartist.directive('chartist', function ($timeout) {
        var linkFn = function (scope, elm, attrs) {
            var data, options, responsiveOptions, selector, updateChart, deepWatchData, deepWatchOptions, deepwatch;
            data = scope.data;
            options = scope.options;
            responsiveOptions = scope.responsiveOptions;
            deepwatch = scope.deepWatch;
            selector = "#" + scope.ngId;
            type = scope.type || 'line';
            elm.attr('id', scope.ngId);
            if (selector == '#price_history_chart') {
                var chart_data = {
                    labels: [],
                    series: []
                };
                chart_data.series[0] = [];
                for (var key in data) {
                    chart_data.labels.push(data[key].date1);
                    chart_data.series[0].push(data[key].price);
                }
                options = {
                    // Don't draw the line chart points
                    showPoint: true,
                    // Disable line smoothing
                    lineSmooth: false,
                    // X-Axis specific configuration
                    axisX: {
                        // We can disable the grid for this axis
                        showGrid: false,
                        // and also don't show the label
                        showLabel: true
                    },
                    // Y-Axis specific configuration
                    axisY: {
                    }
                };
                data = chart_data;
                $timeout(function () {
                    elm.css('height', (elm[0].clientHeight + 5) + 'px');
                }, 100)
            }
            updateChart = function () {
                if (type === 'line') {
                    Chartist.Line(selector, data, options, responsiveOptions);
                } else if (type === 'bar') {
                    Chartist.Bar(selector, data, options, responsiveOptions);
                } else if (type === 'pie') {
                    Chartist.Pie(selector, data, options, responsiveOptions);
                }
            };
            /*
             scope.$watch('data', function (newValue, oldValue) {
             data = newValue;
             updateChart();
             }, deepWatchData);
             
             scope.$watch('options', function (newValue, oldValue) {
             options = newValue;
             updateChart();
             }, deepWatchOptions);
             dont require watchers right now
             */
            updateChart();
        };

        return {
            restrict: 'EA',
            template: '<div class="ct-chart"></div>',
            replace: true,
            scope: {
                data: '=',
                options: '=',
                ngId: '@',
                type: '@',
                responsiveOptions: '=',
                deepWatchData: '=',
                deepWatchOptions: '='
            },
            link: linkFn
        };
    });
})();
