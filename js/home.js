var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic']);

homeMod.directive('resize', ['$window', function ($window) {
        return function (scope, element) {
            angular.element($window).bind('resize', function () {
                console.log('resiez');
                scope.resize();
            });
        };
    }]);

homeMod.controller('HomeCtrl',
        ['$scope', 'friendHelper', '$timeout',
            function ($scope, friendHelper, $timeout) {
                $scope.social_data = [];
                $scope.loading = true;
                $scope.windowWidth = 0;

                $scope.hasMore = false;
                $scope.page = 0;
                $scope.$watch('windowWidth', function (newVaue) {
                    console.log(newVaue);
                    $scope.displayPins();
                });
                $scope.loadMore = function () {
                    var ajax = friendHelper.home($scope.page);
                    ajax.then(function (data) {
                        $scope.social_data = data;
                        $scope.loading = false;

                        if (data.length > 0) {
                            $scope.page++;
                            for (var i = 0; i < data.length; i++) {
                                ajax_data.push(data[i]);
                            }
                            $scope.displayPins(data);
                            $scope.hasMore = true;
                        } else {
                            $scope.hasMore = false;
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');

                    }, function () {
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.loading = false;
                    });
                };
                $scope.loadMore();
                $scope.doRefresh = function () {
                    $scope.page = 0;
                    $scope.loadMore();
                    ajax_data = [];
                }

                $scope.pinColumnWidth = function () {
                    if (pin_column === 0) {
                        return '100%';
                    } else {
                        return Math.round(100 / pin_column, 2) + "%";
                    }
                };
                var timeout_promise = false;
                $scope.resize = function () {
                    if (timeout_promise) {
                        $timeout.cancel(timeout_promise);
                    }
                    timeout_promise = $timeout(function () {
                        $scope.displayPins();
                    }, 100);
                };

                var grid = [];
                var grid_space = [];
                var cur_column = 0;
                var ajax_data = [];
                var level = 1;
                var pin_column = 0;
                var pin_width = 240;
                var total_height = 0;
                var total_pins = 0;
                $scope.initPinsDisplay = function () {
                    grid_space = [];
                    grid = [];
                    cur_column = 0;
                    level = 1;
                    pin_column = 0;
                    pin_width = 240;
                    total_height = 0;
                    total_pins = 0;
                    var window_width = document.querySelector('.menu-content').clientWidth;
                    console.log(window_width);
                    pin_column = Math.floor(window_width / pin_width);
                    if (pin_column === 0) {
                        pin_column = 1;
                    } else if (pin_column < 2) {
                        pin_width = (window_width) / 2 - 2;
                        //2px padding
                        pin_column = 2;
                    } else {
                        pin_width = 240;
                    }

                    console.log(pin_column + 'pin columns');
                };
                $scope.initPinsDisplay();
                $scope.displayPins = function (data) {
                    if (!data) {
                        $scope.initPinsDisplay();
                        data = ajax_data;
                    }
                    if (data.length === 0) {
                        return;
                    }

                    level = 1;

                    for (var i = 0; i < data.length; i++) {
                        var pin = data[i];
                        var pin_height = $scope.getItemHeight(pin, true, false);
                        pin_height = pin_height.replace('px', '') * 1;
                        total_height += pin_height;
                        total_pins++;
                    }

                    var avg_height = total_height / pin_column;
                    console.log(avg_height + 'avg height');

                    for (var i = 0; i < data.length; i++) {
                        var pin = data[i];
                        var pin_height = $scope.getItemHeight(pin, true, false);
                        pin_height = pin_height.replace('px', '') * 1;
                        if (grid_space[cur_column] > avg_height * level) {
                            cur_column++;
                            if (cur_column >= pin_column) {
                                level++;
                                cur_column = 0;
                            }
                        }
                        if (!grid_space[cur_column]) {
                            grid_space[cur_column] = 0;
                        }
                        if (!grid[cur_column]) {
                            grid[cur_column] = [];
                        }
                        grid[cur_column].push(pin);
                        grid_space[cur_column] += pin_height;
                        console.log(grid_space[cur_column] + 'grid space' + i + 'column ' + cur_column);
                        $scope.grid = grid;
                    }

                }

                $scope.getItemWidth = function () {
                    return pin_width + "px";
                }


                $scope.getItemHeight = function (pin, padding, only_image) {
                    var ret = 0;
                    if (pin.dimension && pin.dimension.height) {
                        var height = pin.dimension.height;
                        var width = pin.dimension.width;
                        ret = Math.ceil((height / width) * pin_width) + 100;
                    } else {
                        ret = 250 + 100;
                    }
                    if (only_image) {
                        return (ret - 100) + "px";
                    } else {
                        if (padding) {
                            return (ret + 5) + "px";
                        } else {
                            return (ret) + "px";
                        }
                    }
                };
            }
        ]);