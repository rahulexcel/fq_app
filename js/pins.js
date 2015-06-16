var pinMod = angular.module('PinMod', ['ionicLazyLoad', 'UrlService']);

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
        ['$scope', '$timeout', '$ionicPlatform', '$localStorage', 'friendHelper', 'toast', 'itemHelper', 'pinchServie', 'CDN', 'accountHelper', 'urlHelper',
            function ($scope, $timeout, $ionicPlatform, $localStorage, friendHelper, toast, itemHelper, pinchServie, CDN, accountHelper, urlHelper) {
                $scope.loading = true;
                $scope.windowWidth = 0;
                $scope.page = 0;
                $scope.pin_count = 0;
                $scope.total_pin_count = 0;
                pinchServie.init();
                $scope.$watch('windowWidth', function (newVaue) {
                    $scope.displayPins();
                });
                $scope.$on('reload_pins', function () {
                    $scope.doRefresh();
                });
                $scope.$on('has_no_more', function () {
                    $scope.hasMore = false;
                    console.log('has more');
                });
//                $scope.doRefresh = function () {
//                    $scope.page = 0;
//                    $scope.loadMore();
//                    console.log('from do refresh');
//                };
                var colors = ['#b71c1c', '#880e4f', '#4a148c', '#311b92', '#0d47a1', '#004d40', '#827717', '#1b5e20', '#827717', '#f57f17', '#e65100', '#546e7a', '#757575'];

                $scope.loadMore = function () {
                    console.log('load more getting called');
                    console.log($scope.hasMore);
                    var ajax = $scope.$parent.getData($scope.page);
                    ajax.then(function (data) {
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.loading = false;
                        var new_data = [];
                        if (data.length > 0) {
                            $scope.page++;
                            for (var i = 0; i < data.length; i++) {
                                if (!data[i]) {
                                    continue;
                                }
                                if (!data[i].meta.pins) {
                                    data[i].meta.pins = data[i].pins.length;
                                }
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
                                new_data.push(data[i]);
                            }
                            $scope.pin_count = ajax_data.length;
                            $scope.total_pin_count += ajax_data.length;
                            $scope.displayPins(new_data);
                            $scope.hasMore = true;
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                            $scope.$broadcast('scroll.refreshComplete');
                            $scope.$emit('scroll.infiniteScrollComplete');
                            $scope.$emit('scroll.refreshComplete');
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
                        $scope.hasMore = false;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.loading = false;
                    });
                };
                var load_by_default = true;
                if ($scope.$parent && $scope.$parent.selected_class && $scope.$parent.selected_class === 'wishlist_item') {
                    load_by_default = false;
                    $scope.hasMore = true;
                    $scope.loading = false;
                }
                if (load_by_default) {
                    console.log('from load by default');
                    $scope.loadMore();
                }
                $scope.doRefresh = function () {
                    $scope.page = 0;
                    $scope.initPinsDisplay();
                    ajax_data = [];
                    console.log('from do refresh');
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
//                    if (window_width > 688) {
//                        window_width = window_width - 275;
//                    }
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
                        window.analytics.trackEvent('View Item', 'Pins Page', urlHelper.getPath());
                    }
                    urlHelper.openItemPage(pin_id, list_id);
                };
                $scope.viewList = function (list_id, list_name) {
                    if (window.analytics) {
                        window.analytics.trackEvent('View List', 'Pins Page', urlHelper.getPath());
                    }
                    urlHelper.openWishlistPage(list_id, list_name);
                };
                $scope.followList = function (list_id, index) {
                    if (window.analytics) {
                        window.analytics.trackEvent('Follow List', 'Pins Page', urlHelper.getPath());
                    }
                    if (!$localStorage.user.id) {
                        toast.showShortBottom('SignUp To Follow List');
                        urlHelper.openSignUp();
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
                    $scope.whatsapp(item);
                });
                $scope.$on('fourth', function () {
                    var item = self.getPinObj(pinchServie.active_pin);
                    $scope.facebook(item);
                });
                $scope.pin = function (item) {
                    if (window.analytics) {
                        window.analytics.trackEvent('Pin', 'Pin Page', urlHelper.getPath());
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
                $scope.facebook = function (item) {
                    if (item._id) {
                        var share_url = 'http://fashioniq.in/m/i/' + item._id + "/" + item.original.list_id;
                        var picture = item.image;
                        var name = item.name;
                        picture = CDN.cdnize(picture);
                        if (name.length === 0) {
                            name = 'Awesome Clip!';
                        }
                        if (window.cordova.platformId === "browser") {
                            if (!accountHelper.isFbInit()) {
                                facebookConnectPlugin.browserInit('765213543516434');
                                accountHelper.fbInit();
                            }
                        }
                        facebookConnectPlugin.showDialog({
                            method: 'share',
                            href: share_url,
                            message: name,
                            picture: picture
                        }, function (data) {
                            console.log(data);
                        }, function (data) {
                            console.log(data);
                            toast.showShortBottom('Unable to Share');
                        });
                    }
                };
                $scope.whatsapp = function (item) {
                    console.log('hm');
                    if (item._id) {
                        var share_url = 'http://fashioniq.in/m/i/' + item._id + "/" + item.original.list_id;
                        var picture = item.image;
                        var name = item.name;
                        picture = CDN.cdnize(picture);
                        if (name.length === 0) {
                            name = 'Awesome Clip!';
                        }
                        console.log(name + "XXXhm" + picture + "XXX" + share_url);
                        window.plugins.socialsharing.shareViaWhatsApp(
                                name, picture, share_url, function () {
                                }, function (e) {
                            console.log(e);
                            toast.showShortBottom('Unable to Share! App Not Found');
                        });
                    }
                };
                $scope.like = function (item) {
                    if (window.analytics) {
                        window.analytics.trackEvent('Like', 'Pins Page', urlHelper.getPath());
                    }

                    var item_id = item._id;
                    var list_id = item.original.list_id;
                    if (!$localStorage.user.id) {
                        toast.showShortBottom('SignUp To Like Item');
                        urlHelper.openSignUp();
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