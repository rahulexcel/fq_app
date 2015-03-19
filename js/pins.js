var pinMod = angular.module('PinMod', ['ionicLazyLoad']);
pinMod.factory('pinchServie', ['$ionicBackdrop', '$window',
    function ($ionicBackdrop, $window) {
        var service = {
            bodyElem: false,
            headElem: false,
            animElem: false,
            is_showing: false,
            active_class: false,
            active_pin: false,
            radius: 20,
            positions: {},
            init: function () {
                if (!this.bodyElem) {
                    this.animElem = angular.element(document.querySelector('#anim'));
                    this.headElem = angular.element(document.querySelector('head'));
                    this.bodyElem = angular.element(document.querySelector('body'));
                    this.is_showing = false;
                    this.active_class = false;
                    this.active_pin = false;
                    this.positions = {};
                    this.startTransform();
                    this.classTransform(-1000, -1000);
                }
            },
            destroy: function () {
                this.is_showing = false;
            },
            startTransform: function () {
                this.addTransform(0, 0, 0, 0, 0, 0, 0);
            },
            removeTemp: function () {
                var tempElem = document.querySelector('temp');
                tempElem = angular.element(tempElem);
                tempElem.remove();
            },
            hide: function (event) {
                this.removeTemp();
                this.startTransform();
                this.classTransform(-1000, -1000);
//                console.log('release');
                $ionicBackdrop.release();
                this.is_showing = false;
                return this.active_class;
            },
            classTransform: function (x, y) {
                var css = '';
                var pfx = ["-webkit-", "-moz-", "-MS-", "-o-", ""];
                for (var i = 0; i < pfx.length; i++) {
                    var pf = pfx[i];
                    css += pf + 'transform: translate3d(' + x + 'px,' + y + 'px,0);';
                }
                this.animElem.attr('style', "display:block;" + css);
            },
            addTransform: function (f_x, f_y, s_x, s_y, t_x, t_y) {
                var pfx = ["-webkit-", "-moz-", "-MS-", "-o-", ""];
                var html = '<style id="temp">';
                var style1 = '';
                var style2 = '';
                var style3 = '';
                for (var i = 0; i < pfx.length; i++) {
                    var pf = pfx[i];
                    style1 += pf + 'transform:translate3d(' + (f_x - this.radius) + 'px, ' + (f_y - this.radius) + 'px, 0);';
                    style2 += pf + 'transform:translate3d(' + (s_x - this.radius) + 'px, ' + (s_y - this.radius) + 'px, 0);';
                    style3 += pf + 'transform:translate3d(' + (t_x - this.radius) + 'px, ' + (t_y - this.radius) + 'px, 0);';
                }
                html += '#anim .f_c{' + style1 + '}';
                html += '#anim .s_c{' + style2 + '}';
                html += '#anim .t_c{' + style3 + '}';
                html += '</style>';
                this.headElem.append(html);
            },
            checkIsPin: function (event) {
                var target = angular.element(event.gesture.target);
                var max_depth = 10;
                var found = false;
                var i = 0;
                while (i < max_depth) {

                    target = target.parent();
                    if (target.hasClass('pin')) {
                        this.active_pin = target.attr('id');
//                        console.log(this.active_pin + 'active pin');
                        found = true;
                        break;
                    }
                    i++;
                }
                return found;
            },
            inCircle: function (center, radius, point) {
                var dist = Math.sqrt(Math.pow(center.x - point.x, 2) + Math.pow(center.y - point.y, 2))
//                console.log(dist);
                if (dist < radius) {
                    return true;
                } else {
                    return false;
                }
            },
            caneDrag: function () {
                return this.is_showing;
            },
            handleDrag: function (event) {
                if (this.is_showing) {

//                    console.log('handling drag');
//                    var target = angular.element(event.gesture.target);

                    var x = event.gesture.center.pageX;
                    var y = event.gesture.center.pageY;
                    var positions = this.positions;
                    var radius = this.radius;
                    var f_c = positions.first;
                    var s_c = positions.second;
                    var t_c = positions.thrid;
                    var center = positions.center;
//                    var imageRect = $ionicPosition.offset(this.bodyElem);
//                    console.log(imageRect);

//                    console.log('org pos');
//                    console.log({x: x, y: y});
//                    angular.element(document.querySelector('#dot')).attr('style', 'top:' + y + 'px;left:' + x + 'px')
                    y = y * 1 - center.y * 1;
                    x = x * 1 - center.x * 1;


                    var found_f = false;
                    var found_s = false;
                    var found_t = false;

//                    console.log('pos');
//                    console.log({x: x, y: y});
//
////                    console.log('center');
////                    console.log(center);
//
//                    console.log('first');
//                    console.log(f_c);
//
//                    console.log('second');
//                    console.log(s_c);
//
//                    console.log('third');
//                    console.log(t_c);
//                    angular.element(document.querySelector('#dot1')).attr('style', 'top:' + (f_c.y * 1 + center.y * 1) + 'px;left:' + (f_c.x * 1 + center.x * 1) + 'px')
//                    angular.element(document.querySelector('#dot2')).attr('style', 'top:' + (s_c.y * 1 + center.y * 1) + 'px;left:' + (s_c.x * 1 + center.x * 1) + 'px')
//                    angular.element(document.querySelector('#dot3')).attr('style', 'top:' + (t_c.y * 1 + center.y * 1) + 'px;left:' + (t_c.x * 1 + center.x * 1) + 'px')

                    if (this.inCircle({x: x, y: y}, radius, f_c)) {
                        found_f = true;
                    }
                    if (this.inCircle({x: x, y: y}, radius, s_c)) {
                        found_s = true;
                    }
                    if (this.inCircle({x: x, y: y}, radius, t_c)) {
                        found_t = true;
                    }
                    if (found_f) {
                        if (this.active_class !== 'f') {
                            angular.element(document.querySelector('.f_c')).toggleClass('active_circle');
                            this.active_class = 'f';
                        }
                    } else {
                        if (this.active_class === 'f') {
                            angular.element(document.querySelector('.f_c')).toggleClass('active_circle');
                            this.active_class = '';
                        }
                    }
                    if (found_s) {
                        if (this.active_class !== 's') {
                            angular.element(document.querySelector('.s_c')).toggleClass('active_circle');
                            this.active_class = 's';
                        }
                    } else {
                        if (this.active_class === 's') {
                            angular.element(document.querySelector('.s_c')).toggleClass('active_circle');
                            this.active_class = '';
                        }
                    }
                    if (found_t) {
                        if (this.active_class !== 't') {
                            angular.element(document.querySelector('.t_c')).toggleClass('active_circle');
                            this.active_class = 't';
                        }
                    } else {
                        if (this.active_class === 't') {
                            angular.element(document.querySelector('.t_c')).toggleClass('active_circle');
                            this.active_class = '';
                        }
                    }


                    return true;
                } else {
                    return false;
                }
            },
            show: function (event, pin_id) {
                console.log('hold');
                if (!this.checkIsPin(event)) {
                    console.log('is not pin');
                    return false;
                }

                this.positions = {};
                angular.element(document.querySelector('.s_c')).removeClass('active_circle');
                angular.element(document.querySelector('.t_c')).removeClass('active_circle');
                angular.element(document.querySelector('.t_c')).removeClass('active_circle');
                this.active_class = false;
                this.is_showing = true;
                var x = event.gesture.center.pageX;
                var y = event.gesture.center.pageY;
                this.classTransform(x, y);
                var length = 75;
                var window_width = $window.innerWidth;
                var window_height = $window.innerHeight;
                var down = true;
                var right = true;
                if (y > window_height / 2) {
                    //down = false;
                    //let it be top always like pintrest
                }
                if (x > window_width / 2) {
                    right = false;
                }

                var f_c_coord = {
                    x: Math.round(Math.sin(Math.PI / 12) * length, 2) * -1,
                    y: length * -1
                };
                var s_c_coord = {
                    x: Math.round(Math.cos(Math.PI / 4) * length, 2),
                    y: Math.round(Math.cos(Math.PI / 4) * length, 2) * -1
                };
                var t_c_coord = {
                    x: length,
                    y: Math.round(Math.sin(Math.PI / 12) * length * -1, 2) * -1
                };
                this.positions = {
                    center: {
                        x: x,
                        y: y
                    },
                    first: f_c_coord,
                    second: s_c_coord,
                    thrid: t_c_coord
                };
                if (!right) {
                    f_c_coord.x = f_c_coord.x * -1;
                    s_c_coord.x = s_c_coord.x * -1;
                    t_c_coord.x = t_c_coord.x * -1;
                }
                if (!down) {
                    f_c_coord.y = f_c_coord.y * -1;
                    s_c_coord.y = s_c_coord.y * -1;
                    t_c_coord.y = t_c_coord.y * -1;
                }
                this.removeTemp();
                this.addTransform(f_c_coord.x, f_c_coord.y, s_c_coord.x, s_c_coord.y, t_c_coord.x, t_c_coord.y);
                $ionicBackdrop.retain();
                return true;
            }
        };
        return service;
    }
]);
pinMod.directive('pinch', ['pinchServie', '$ionicGesture', '$timeout', '$ionicScrollDelegate',
    function (pinchServie, $ionicGesture, $timeout, $ionicScrollDelegate) {
        return {
            link: {
                pre: function preLink(scope, iElement, iAttrs, controller) {
                },
                post: function postLink(scope, iElement, iAttrs, controller) {
                    var relase_gesture = false;
                    var drag_gesture = false;
                    var hold_gesture = false;
                    pinchServie.init();
//                    console.log('init');
                    scope.$on('$destroy', function () {
//                        console.log('destroy');
                        pinchServie.destroy();
                        $ionicGesture.off(relase_gesture, 'release');
                        $ionicGesture.off(drag_gesture, 'drag');
                        $ionicGesture.off(hold_gesture, 'hold');
                    });
                    var wait_for_anim = false;
                    relase_gesture = $ionicGesture.on('release', function (e) {
                        var ret = pinchServie.hide(e);
                        if (ret === 'f') {
                            scope.$broadcast('first');
                        } else if (ret === 's') {
                            scope.$broadcast('second');
                        } else if (ret === 't') {
                            scope.$broadcast('third');
                        }
                        $ionicScrollDelegate.freezeAllScrolls(false);
                        e.preventDefault();
                        e.stopPropagation();
                    }, angular.element(iElement));
                    drag_gesture = $ionicGesture.on('drag', function (e) {
                        if (!wait_for_anim) {
                            if (pinchServie.caneDrag(e)) {
                                pinchServie.handleDrag(e)
                                e.preventDefault();
                                e.stopPropagation();
                            } else {
                            }
                        }
                    }, angular.element(iElement));
                    hold_gesture = $ionicGesture.on('hold', function (e) {
                        if (pinchServie.show(e, iAttrs.id)) {
                            $ionicScrollDelegate.freezeAllScrolls(true);
                            wait_for_anim = true;
                            $timeout(function () {
                                wait_for_anim = false;
                            }, 100);
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }, angular.element(iElement));
                }
            }
        };
    }
]);
pinMod.directive('resize', ['$window', function ($window) {
        return function (scope, element) {
            angular.element($window).bind('resize', function () {
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
        ['$scope', '$timeout', '$location', '$rootScope', '$localStorage', 'friendHelper', 'toast', 'itemHelper', 'pinchServie', 'CDN',
            function ($scope, $timeout, $location, $rootScope, $localStorage, friendHelper, toast, itemHelper, pinchServie, CDN) {
                $scope.loading = true;
                $scope.windowWidth = 0;
                $scope.hasMore = false;
                $scope.page = 0;
                $scope.pin_count = 0;
                $scope.total_pin_count = 0;
                pinchServie.init();
                $rootScope.$on('custom_ionicExposeAside', function () {
                    $timeout(function () {
                        $scope.displayPins();
                    }, 1008);
                });
                $scope.$watch('windowWidth', function (newVaue) {
                    $scope.displayPins();
                });
                $scope.doRefresh = function () {
//                    console.log('do refresh');
                    $scope.page = 0;
                    $scope.loadMore();
                };
                var colors = ['#b71c1c', '#880e4f', '#4a148c', '#311b92', '#0d47a1', '#004d40', '#827717', '#1b5e20', '#827717', '#f57f17', '#e65100', '#546e7a', '#757575'];
                $scope.loadMore = function () {
//                    console.log('load more');
                    var ajax = $scope.$parent.getData($scope.page);
                    ajax.then(function (data) {
                        $scope.loading = false;
//                        console.log(data);
                        if (data.length > 0) {
                            $scope.page++;
                            for (var i = 0; i < data.length; i++) {

                                var index = Math.floor(Math.random() * (colors.length + 1));
                                var color = colors[index];
                                if (!color) {
                                    color = colors[0];
                                }

                                var height = $scope.getItemHeight(data[i], false, true);
                                data[i].pin_height = height;
                                data[i].pin_height_full = $scope.getItemHeight(data[i], true, false);
                                data[i].pin_color = color;
                                if (!data[i].pins || data[i].pins.length === 0) {
                                    data[i].pins = 0;
                                }
                                if (!data[i].likes || data[i].likes.length === 0) {
                                    data[i].likes = 0;
                                }

                                if ($localStorage.user.id && $localStorage.user.id === data[i].original.user_id) {
                                    data[i].canPin = false;
                                } else {
                                    if (data[i].pins && data[i].pins.length > 0) {
                                        data[i].canPin = true;
                                        for (var m = 0; m < data[i].pins.length; m++) {
                                            if (data[i].pins[m] === $localStorage.user.id) {
                                                data[i].canPin = false;
                                                break;
                                            }
                                        }
                                    } else {
                                        data[i].canPin = true;
                                    }
                                }

                                if ($localStorage.user.id && $localStorage.user.id === data[i].original.user_id) {
                                    data[i].canLike = false;
                                } else {
                                    if (data[i].likes && data[i].likes.length > 0) {
                                        data[i].canLike = true;
                                        for (var m = 0; m < data[i].likes.length; m++) {
                                            if (data[i].likes[m].user_id === $localStorage.user.id) {
                                                data[i].canLike = false;
                                                break;
                                            }
                                        }
                                    } else {
                                        data[i].canLike = true;
                                    }
                                }
                                ajax_data.push(data[i]);
                            }
                            $scope.pin_count = ajax_data.length;
                            $scope.total_pin_count += ajax_data.length;
                            $scope.displayPins(data);
                            $scope.hasMore = true;
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                            $scope.$broadcast('scroll.refreshComplete');
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
                $scope.loadMore();
                $scope.doRefresh = function () {
                    $scope.page = 0;
                    $scope.initPinsDisplay();
                    ajax_data = [];
                    $scope.loadMore();
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
                        $scope.initPinsDisplay();
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
                $scope.pin_width_no = pin_width;
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
//                    console.log('window width ' + window_width);
                    pin_column = Math.floor(window_width / pin_width);
                    if (pin_column < 2) {
                        pin_width = (window_width) / 2 - 10;
                        $scope.pin_width = pin_width + "px";
                        $scope.pin_width_no = pin_width;
                        //2px padding
                        pin_column = 2;
                        angular.element(document.querySelector('.pin_list_container')).attr('style', 'width:100%;');
                    } else {
                        pin_width = 240;
                        $scope.pin_width = pin_width + "px";
                        $scope.pin_width_no = pin_width;
                        angular.element(document.querySelector('.pin_list_container')).attr('style', 'width:' + (pin_width * pin_column + 10 * pin_column) + 'px;');
                    }
                    $scope.col_width = Math.round(100 / pin_column, 2) + "%";
//                    console.log(pin_column + 'pin columns');
                    $scope.grid1 = grid1;
                    $scope.grid2 = grid2;
                    $scope.grid3 = grid3;
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
                        var pin_height = data[i].pin_height;
                        pin_height = pin_height.replace('px', '') * 1;
                        total_height += pin_height;
                        total_pins++;
                    }

                    var avg_height = total_height / pin_column;
                    for (var i = 0; i < data.length; i++) {
                        var pin = data[i];
                        var pin_height = data[i].pin_height;
                        pin_height = pin_height.replace('px', '') * 1;
                        if (!grid_space[cur_column]) {
                            grid_space[cur_column] = 0;
                        }
                        if (!grid[cur_column]) {
                            grid[cur_column] = [];
                        }
                        //grid[cur_column].push(pin);
//                        console.log('pin_height ' + i + "XXXX" + pin_height);
                        if (cur_column > 2) {
                            cur_column = 0;
                        }

//                        if (grid_space[cur_column] + pin_height > avg_height * level) {
                        if (cur_column === 0) {
                            grid1.push(pin);
                        } else if (cur_column === 1) {
                            grid2.push(pin);
                        } else if (cur_column === 2) {
                            grid3.push(pin);
                        }

                        var next_column = cur_column + 1;
                        if (next_column > 2) {
                            next_column = 0;
                        }
                        if (!grid_space[next_column]) {
                            grid_space[next_column] = 0;
                        }
                        if (grid_space[cur_column] + pin_height > grid_space[next_column]) {
                            cur_column++;
                            if (cur_column >= pin_column) {
                                level++;
                                cur_column = 0;
                            }
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
                    //added 100px for text below image

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
                    if (window.analytics) {
                        window.analytics.trackEvent('View Item', 'Pins Page', $location.path());
                    }
                    $location.path('/app/item/' + pin_id + '/' + list_id);
                };
                $scope.viewList = function (list_id, list_name) {
                    if (window.analytics) {
                        window.analytics.trackEvent('View List', 'Pins Page', $location.path());
                    }
                    $location.path('/app/wishlist_item/' + list_id + '/' + list_name + "/pins");
                };
                $scope.followList = function (list_id, index) {
                    if (window.analytics) {
                        window.analytics.trackEvent('Follow List', 'Pins Page', $location.path());
                    }
                    if (!$localStorage.user.id) {
                        toast.showShortBottom('SignUp To Follow List');
                        $location.path('/app/signup');
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
                var self = this;
                self.getPinObj = function (pin_id) {
                    for (var i = 0; i < grid1.length; i++) {
                        if (grid1[i]._id === pin_id) {
                            return grid1[i];
                        }
                    }
                    for (var i = 0; i < grid2.length; i++) {
                        if (grid2[i]._id === pin_id) {
                            return grid2[i];
                        }
                    }
                    for (var i = 0; i < grid3.length; i++) {
                        if (grid3[i]._id === pin_id) {
                            return grid3[i];
                        }
                    }
                };

//                $scope.hold = function (e) {
//                    console.log('hold');
////                    pinchServie.show(e, pin._id);
//                }
//                $scope.drag = function (e) {
//                    pinchServie.handleDrag(e);
//                }
//                $scope.release = function (e) {
//                    var ret = pinchServie.hide(e);
//                    if (ret === 'f') {
//                        $scope.$broadcast('first');
//                    } else if (ret === 's') {
//                        $scope.$broadcast('second');
//                    } else if (ret === 't') {
//                        $scope.$broadcast('third');
//                    }
//                }
                $scope.$on('first', function () {
                    var item = self.getPinObj(pinchServie.active_pin);
                    $scope.pin(item);
                });
                $scope.$on('second', function () {
                    console.log(pinchServie.active_pin);
                    var item = self.getPinObj(pinchServie.active_pin);
                    $scope.like(item);
                });
                $scope.$on('third', function () {
                    var item = self.getPinObj(pinchServie.active_pin);
                    $scope.shareAll(item);
                });
                $scope.pin = function (item) {
                    if (window.analytics) {
                        window.analytics.trackEvent('Pin', 'Pin Page', $location.path());
                    }
                    if (!$localStorage.user.id) {
                        toast.showShortBottom('SignUp/Login To Pin Item');
                    } else {
                        $scope.wishlist_product.product = false;
                        $scope.wishlist_product.new_item = false;
                        $scope.wishlist_product.item = item;
                        $scope.$parent.showWishlist();
                    }
                };
                $scope.shareAll = function (item) {
                    var share_url = 'http://fashioniq.in/m/i/' + item._id + "/" + item.original.list_id;
                    var picture = item.image;
                    var name = item.name;
                    picture = CDN.cdnize(picture);
                    if (name.length === 0) {
                        name = 'Awesome Clip!';
                    }
                    window.plugins.socialsharing.share(name, null, picture, share_url, function () {
                    }, function () {
                        toast.showShortBottom('Unable to Share');
                    });
                };
                $scope.like = function (item) {
                    if (window.analytics) {
                        window.analytics.trackEvent('Like', 'Pins Page', $location.path());
                    }

                    var item_id = item._id;
                    var list_id = item.original.list_id;
                    if (!$localStorage.user.id) {
                        toast.showShortBottom('SignUp To Like Item');
                        $location.path('/app/signup');
                    } else {
                        if ($scope.request_process) {
                            toast.showProgress();
                            return;
                        }
                        $scope.request_process = true;
                        var ajax = itemHelper.like(item_id, list_id);
                        ajax.then(function (data) {
                            toast.showShortBottom('Item Liked');
                            $scope.request_process = false;
                        }, function () {
                            $scope.request_process = false;
                        });
                    }
                };
            }
        ]);