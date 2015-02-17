var pinMod = angular.module('PinMod', []);

pinMod.directive('resize', ['$window', function ($window) {
        return function (scope, element) {
            angular.element($window).bind('resize', function () {
                console.log('resiez');
                scope.resize();
            });
        };
    }]);

pinMod.filter('nl2br', ['$sce', function ($sce) {
        return function (text) {
            return text ? $sce.trustAsHtml(text.replace(/\n/g, '<br/>')) : '';
        };
    }]);
pinMod.controller('PinCtrl',
        ['$scope', '$timeout', '$location', '$rootScope', '$localStorage', 'friendHelper', 'toast',
            function ($scope, $timeout, $location, $rootScope, $localStorage, friendHelper, toast) {
                var ajax_data = [];
                $scope.loading = true;
                $scope.windowWidth = 0;
                $scope.hasMore = false;
                $scope.page = 0;
                $scope.pin_count = 0;
                $scope.total_pin_count = 0;
                $rootScope.$on('custom_ionicExposeAside', function () {
                    $timeout(function () {
                        $scope.displayPins();
                    }, 1008);
                });
                $scope.$watch('windowWidth', function (newVaue) {
                    $scope.displayPins();
                });
                $scope.doRefresh = function () {
                    $scope.page = 0;
                    $scope.loadMore();
                };
                $scope.loadMore = function () {
                    var ajax = $scope.$parent.getData($scope.page);
                    ajax.then(function (data) {
                        $scope.loading = false;
                        console.log(data);
                        if (data.length > 0) {
                            $scope.page++;
                            for (var i = 0; i < data.length; i++) {
                                var height = $scope.getItemHeight(data[i], true, false);
                                data[i].pin_height = height;
                                if (!data[i].pins || data[i].pins.length === 0) {
                                    data[i].pins = 0;
                                }
                                if (!data[i].likes || data[i].likes.length === 0) {
                                    data[i].likes = 0;
                                }
                                ajax_data.push(data[i]);
                            }
                            $scope.pin_count = ajax_data.length;
                            $scope.total_pin_count += ajax_data.length;
                            $scope.displayPins(data);
                            $scope.hasMore = true;
                        } else {
                            $scope.hasMore = false;

                            //for home page feed
                            if ($scope.$parent.selected_class === 'feed') {
                                var ajax2 = $scope.$parent.loadTopLists();
                                ajax2.then(function (data2) {
                                    for (var i = 0; i < data2.length; i++) {
                                        data2[i].is_following = false;
                                    }
                                    $scope.top_lists = data2;
                                    $scope.$broadcast('scroll.infiniteScrollComplete');
                                    $scope.$broadcast('scroll.refreshComplete');
                                });

                            } else {
                                $scope.$broadcast('scroll.infiniteScrollComplete');
                                $scope.$broadcast('scroll.refreshComplete');
                            }
                        }
                    }, function () {
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.loading = false;
                    });
                };
//                $scope.start = function () {
                $scope.loadMore();
//                }
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
                    console.log('resize');
                    if (timeout_promise) {
                        $timeout.cancel(timeout_promise);
                    }
                    timeout_promise = $timeout(function () {
                        $scope.displayPins();
                    }, 100);
                };
                var grid = [];
                var grid1 = [];
                var grid2 = [];
                var grid3 = [];
                var grid4 = [];
                var grid5 = [];
                var grid_space = [];
                var cur_column = 0;
                var ajax_data = [];
                var level = 1;
                var pin_column = 0;
                var pin_width = 240;
                $scope.pin_width = pin_width + "px";
                var total_height = 0;
                var total_pins = 0;
                $scope.initPinsDisplay = function () {
                    grid_space = [];
                    grid = [];
                    grid1 = [];
                    grid2 = [];
                    grid3 = [];
                    grid4 = [];
                    grid5 = [];
                    cur_column = 0;
                    level = 1;
                    pin_column = 0;
                    pin_width = 240;
                    total_height = 0;
                    total_pins = 0;
                    var window_width = document.querySelector('.menu-content').clientWidth;
                    if (window_width > 688) {
                        window_width = window_width - 275;
                    }
                    console.log(window_width);
                    pin_column = Math.floor(window_width / pin_width);
                    if (pin_column < 2) {
                        pin_width = (window_width) / 2 - 10;
                        $scope.pin_width = pin_width + "px";
                        //2px padding
                        pin_column = 2;
                        angular.element(document.querySelector('.pin_list_container')).attr('style', 'width:100%;');
                    } else {
                        pin_width = 240;
                        $scope.pin_width = pin_width + "px";
                        angular.element(document.querySelector('.pin_list_container')).attr('style', 'width:' + (pin_width * pin_column + 10 * pin_column) + 'px;');
                    }
                    $scope.col_width = Math.round(100 / pin_column, 2) + "%";
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
                        //var pin_height = $scope.getItemHeight(pin, true, false);
                        var pin_height = data[i].pin_height;
                        pin_height = pin_height.replace('px', '') * 1;
                        total_height += pin_height;
                        total_pins++;
                    }

                    var avg_height = total_height / pin_column;
                    console.log(avg_height + 'avg height');
                    for (var i = 0; i < data.length; i++) {
                        var pin = data[i];
                        //var pin_height = $scope.getItemHeight(pin, true, false);
                        var pin_height = data[i].pin_height;
                        pin_height = pin_height.replace('px', '') * 1;
                        if (grid_space[cur_column] + pin_height > avg_height * level) {
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
                        //grid[cur_column].push(pin);
                        console.log('pin_height ' + i + "XXXX" + pin_height);
                        if (cur_column > 2) {
                            cur_column = 0;
                        }
                        if (cur_column === 0) {
                            grid1.push(pin);
                        } else if (cur_column === 1) {
                            grid2.push(pin);
                        }
                        else if (cur_column === 2) {
                            grid3.push(pin);
                        }
//                        else if (cur_column === 3) {
//                            grid4.push(pin);
//                        } else if (cur_column === 4) {
//                            grid5.push(pin);
//                        }
                        grid_space[cur_column] += pin_height;
//                        console.log(grid_space[cur_column] + 'grid space' + i + 'column ' + cur_column);
                        $scope.grid = grid;
                        $scope.grid1 = grid1;
                        $scope.grid2 = grid2;
                        $scope.grid3 = grid3;
                    }

                };
                $scope.getItemWidth = function () {
                    return pin_width + "px";
                };
                $scope.analyzeHeight = function (text) {
                    //do this. take in consideration new line characters also  

                    var singleLine = 34;
                    if (pin_width < 240) {
                        singleLine = 30; //in mobile doesnt work properly always
                        singleLine = Math.floor(pin_width * 24 / 240);
                    }

//                    console.log(singleLine + "words in single line");
                    var words = text.split(' ');

                    var line = 0;
                    var charPerLine = 0;

//                    console.log(words);

                    for (var i = 0; i < words.length; i++) {
                        var word = words[i];
                        if (word.indexOf('\n') !== -1) {
//                            console.log('new line');
                            line = line + word.match(/\n/g).length;
                            charPerLine = 0;
                        } else {
                            var chars = words.length;
//                            console.log(charPerLine + "XXXX" + chars);
                            if (charPerLine + chars + 1 < singleLine) {
                                charPerLine += chars;
                            } else {
                                line++;
                                charPerLine = chars;
                            }
                        }
                    }
//                    console.log(line);
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
                    $location.path('/app/wishlist_item/' + list_id + '/' + list_name + "/pins");
                };
                $scope.followList = function (list_id, index) {
                    if (!$localStorage.user.id) {
                        toast.showShortBottom('SignUp/Login To Follow List');
                    } else {
                        if ($scope.request_process) {
                            toast.showProgress();
                            return;
                        }
                        $scope.request_process = true;
                        var ajax = friendHelper.list_follow(list_id);
                        ajax.then(function (data) {
                            var top_lists = $scope.top_lists;
                            var new_top_list = [];
                            for (var i = 0; i < top_lists.length; i++) {
                                if (i !== index) {
                                    new_top_list.push(top_lists[i]);
                                }
                            }
                            $scope.top_lists = new_top_list;
                            $scope.request_process = false;
                        }, function () {
                            $scope.request_process = false;
                        });
                    }
                };
            }
        ]);