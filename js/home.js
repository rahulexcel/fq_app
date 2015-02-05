var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic']);

homeMod.directive('resize', ['$window', function ($window) {
        return function (scope, element) {
            angular.element($window).bind('resize', function () {
                console.log('resiez');
                scope.resize();
            });
        };
    }]);

homeMod.filter('nl2br', ['$sce', function ($sce) {
        return function (text) {
            return text ? $sce.trustAsHtml(text.replace(/\n/g, '<br/>')) : '';
        };
    }]);
homeMod.controller('HomeCtrl',
        ['$scope', 'friendHelper', '$timeout', '$location', '$rootScope',
            function ($scope, friendHelper, $timeout, $location, $rootScope) {
                $scope.social_data = [];
                $scope.loading = true;
                $scope.windowWidth = 0;
                $scope.hasMore = false;
                $scope.page = 0;
                $rootScope.$on('custom_ionicExposeAside', function () {
                    $timeout(function () {
                        $scope.displayPins();
                    }, 1008);
                });
                $scope.$watch('windowWidth', function (newVaue) {
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
                        $scope.$broadcast('scroll.refreshComplete');
                    }, function () {
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.loading = false;
                    });
                };
                $scope.loadMore();
                $scope.doRefresh = function () {
                    $scope.page = 0;
                    $scope.loadMore();
                    ajax_data = [];
                };
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
                        angular.element(document.querySelector('.pin_list_container')).attr('style', 'width:100%;');
                    } else if (pin_column < 2) {
                        pin_width = (window_width) / 2 - 2;
                        //2px padding
                        pin_column = 2;
                        angular.element(document.querySelector('.pin_list_container')).attr('style', 'width:100%;');
                    } else {
                        pin_width = 240;
                        angular.element(document.querySelector('.pin_list_container')).attr('style', 'width:' + (pin_width * pin_column + 2 * pin_column) + 'px;');
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

                };
                $scope.getItemWidth = function () {
                    return pin_width + "px";
                };
                $scope.analyzeHeight = function (text) {
                    //do this. take in consideration new line characters also  

                    var singleLine = 34;
                    if (pin_width < 240) {
                        singleLine = Math.floor(pin_width * 24 / 240);
                    }
                    var words = text.split(' ');

                    var line = 0;
                    var charPerLine = 0;

                    console.log(words);

                    for (var i = 0; i < words.length; i++) {
                        var word = words[i];
                        if (word.indexOf('\n') !== -1) {
                            console.log('new line');
                            line = line + word.match(/\n/g).length;
                            charPerLine = 0;
                        } else {
                            var chars = words.length;
                            console.log(charPerLine + "XXXX" + chars);
                            if (charPerLine + chars + 1 < singleLine) {
                                charPerLine += chars;
                            } else {
                                line++;
                                charPerLine = chars;
                            }
                        }
                    }
                    console.log(line);
                    if (line > 2) {
                        return 18 * (line - 2);
                    } else {
                        return 0;
                    }
                };
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
                        //single row = 34 characters
                        if (pin.name && pin.name.length > 0) {
                            ret += $scope.analyzeHeight(pin.name);
                        } else if (pin.description && pin.description.length > 0) {
                            ret += $scope.analyzeHeight(pin.description);
                        }
                        if (padding) {
                            return (ret + 5) + "px";
                        } else {
                            return (ret) + "px";
                        }
                    }
                };
                $scope.viewItem = function (pin_id, list_id) {
                    $location.path('/app/item/' + pin_id + '/' + list_id);
                };
                $scope.viewList = function (list_id, list_name) {
                    $location.path('/app/wishlist_item/' + list_id + '/' + list_name);
                }
            }
        ]);