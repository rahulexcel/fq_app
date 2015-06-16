var alertMod = angular.module('AlertMod', ['ServiceMod', 'UrlService']);

alertMod.controller('AlertCtrl',
        ['$scope', '$localStorage', 'toast', '$stateParams', 'dataShare', '$ionicSlideBoxDelegate', 'productHelper', 'timeStorage', 'notifyHelper', '$ionicPopup', '$ionicPosition', '$window', '$timeout', 'urlHelper', '$ionicModal', '$timeout', '$ionicScrollDelegate', '$rootScope',
            function ($scope, $localStorage, toast, $stateParams, dataShare, $ionicSlideBoxDelegate, productHelper, timeStorage, notifyHelper, $ionicPopup, $ionicPosition, $window, $timeout, urlHelper, $ionicModal, $timeout, $ionicScrollDelegate, $rootScope) {
                var self = this;
                $scope.$on('modal.shown', function () {
                    $rootScope.$emit('hide_android_add');
                });
                $scope.$on('modal.hidden', function () {
                    $rootScope.$emit('show_android_add');
                });
                self.normalizeData = function (data) {
                    if (data) {
                        var newData = {};
                        var change = false;
                        var old_price = 0;
                        for (var i = 0; i < data.length; i++) {
                            var row = data[i];
                            if (row.time && row.price * 1 > 0) {
                                var datetime = new Date(row.time * 1000);
                                var key = row.time;
                                var price = row.price;
                                var x = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
                                var key = datetime.getDate() + "-" + x[datetime.getMonth()];
                                if (newData[key] && price < newData[key].price) {
                                    newData[key] = {
                                        price: price,
                                        time: row.time
                                    };
                                } else {
                                    newData[key] = {
                                        price: price,
                                        time: row.time
                                    };
                                }
                                if (old_price === 0) {
                                    old_price = price;
                                } else {
                                    if (price !== old_price) {
                                        change = true;
                                    }
                                }
                            }
                        }
                        if (change) {
                            var time_data = [];
                            for (var x in newData) {
                                time_data.push({
                                    price: newData[x].price,
                                    time: x
                                });
                            }

                            time_data = self.compressDuplicateData(time_data);
                            time_data = self.compressOldData(time_data);

                            newData = {};
                            for (var i = 0; i < time_data.length; i++) {
                                newData[time_data[i].time] = time_data[i].price;
                            }
                            return newData;
                        } else {
                            return {};
                        }
                    } else {
                        return {};
                    }
                };

                self.compressOldData = function (time_data) {
                    var max_data_points = 9; //maximum data points to show
                    if (time_data.length > max_data_points) {

                        time_data = time_data.slice(1);
                        return self.compressOldData(time_data);
                    } else {
                        return time_data;
                    }
                };

                self.compressDuplicateData = function (time_data) {
                    var max_data_points = 9; //maximum data points to show
                    if (time_data.length > max_data_points) {

                        var new_time_data = [];
                        var skip = false;
                        var change_done = false;
                        for (var i = 0; i < time_data.length; i++) {
                            if (change_done) {
                                new_time_data.push({
                                    price: time_data[i].price,
                                    time: time_data[i].time
                                });
                                continue;
                            }
                            if (time_data[i + 1]) {
                                var price = time_data[i].price;
                                var next_price = time_data[i + 1].price;

                                if (price * 1 === next_price * 1) {
                                    skip = true;
                                } else {
                                    skip = false;
                                }
                            } else {
                                skip = false;
                            }
                            if (!skip) {
                                new_time_data.push({
                                    price: time_data[i].price,
                                    time: time_data[i].time
                                });
                            } else {
                                change_done = true;
                            }
                        }

                        if (!change_done) {
                            return new_time_data;
                        } else {
                            return self.compressDuplicateData(new_time_data);
                        }
                    } else {
                        return time_data;
                    }
                };
                $scope.fetchLatest = function (href) {
                    if (!href) {
                        return;
                    }
                    self.fetch_latest_done = true;
                    var ajax2 = productHelper.fetchLatest(href, alert.fq_product_id);
                    var cache_key = 'product_' + alert.fq_product_id;
                    ajax2.then(function (data) {
                        var price = data.price;
                        var more_images = data.more_images;

                        var data1 = timeStorage.get(cache_key);
                        if (data1) {
                            data1.price = price;
                            data1.more_images = more_images;
                            timeStorage.set(cache_key, data1, 1);
                        }

                        price = Math.round(price);
                        if (price > 0)
                            $scope.alert.price = price;
                        if (more_images && more_images.length > 0) {
                            $scope.alert.more_images = more_images;
                            $scope.zoom_images = more_images;
                        } else {
                        }
                        $ionicSlideBoxDelegate.update();
                    });
                };
                self.populateData = function (alert) {
                    if (alert.user_id + "" === $localStorage.user.id + "") {
                        $scope.mine = true;
                    } else {
                        $scope.mine = false;
                    }

                    var price_history_data = alert.price_history_data;
                    price_history_data = self.normalizeData(price_history_data);
                    var chart_data = {
                        labels: [],
                        series: []
                    };
                    var key_points = 0;
                    chart_data.series[0] = [];
                    for (var key in price_history_data) {
                        chart_data.labels.push(key);
                        chart_data.series[0].push(price_history_data[key]);
                        key_points++;
                    }
//                            console.log(price_history_data);
//                            console.log(chart_data);
//                            console.log(key_points);

                    alert.limit = '';
                    alert.stopped_notify = false;
                    var user_setting = alert.user_setting;
                    if (user_setting) {
                        for (var j = 0; j < user_setting.length; j++) {
                            if (user_setting[j].user_id + "" === $localStorage.user.id + "" && user_setting[j].price * 1 === -1) {
                                alert.stopped_notify = true;
                                break;
                            } else if (user_setting[j].user_id + "" === $localStorage.user.id + "") {
                                alert.limit = user_setting[j].price * 1;
                                break;
                            }
                        }
                    }

                    alert.data = chart_data;
                    if (key_points === 0) {
                        alert.show_chart = false;
                    } else {
                        alert.show_chart = true;
                    }

                    $scope.alert = alert;
                    $scope.fetchLatest(alert.url, alert.fq_product_id);
                    if (alert.fq_product_id) {
                        var ajax = productHelper.fetchProduct(alert.fq_product_id);
                        ajax.then(function (data) {
                            $scope.processProductData(data);
                        }, function () {
                        });
                    }
                };

                $scope.$on('$destory', function () {
                    $scope.myScroll.destroy();
                    $scope.myScroll = null;
                });
                $scope.processProductData = function (data) {
                    $scope.product = {};
                    if (data.variants)
                        $scope.product.variants = data.variants;
                    if (data.similar)
                        $scope.product.similar = data.similar;


                    if (data.similar && data.similar.length > 0) {
                        self.processSimliarData(data, $scope.alert.fq_product_id);
                    } else {
                        var ajax2 = productHelper.fetchSimilar($scope.alert.fq_product_id);
                        ajax2.then(function (data) {
                            self.processSimliarData(data, $scope.alert.fq_product_id);
                        });
                    }
                    if (data.variants) {
                        self.processVariantData(data);
                    } else {
                        var ajax3 = productHelper.fetchVariant($scope.alert.fq_product_id);
                        ajax3.then(function (data) {
                            self.processVariantData(data);
                        });
                    }
                };

                self.processSimliarData = function (data, product_id) {
                    if (data.similar && data.similar.length > 0) {
                        console.log('initiazling iscroll');
                        if (data.similar.length > 0) {
                            $scope.product.similar = data.similar;
                            $timeout(function () {
                                var width = data.similar.length * 152;
                                if (width < $window.innerWidth) {
                                    width = $window.innerWidth;
                                }
                                angular.element(document.querySelector('.scroller_' + product_id)).attr('style', 'width:' + (width) + "px");
                            }, 100);
                            $ionicScrollDelegate.resize();
                        }
                    }
                };
                self.processVariantData = function (data) {
                    if (data.variants) {
                        $scope.product.variants = data.variants;
                        $ionicScrollDelegate.resize();
                    }
                };
                $scope.$on('$stateChangeSuccess', function () {
                    $scope.start();
                });
                $scope.doRefresh = function () {
                    $scope.start();
                };
                $scope.start = function () {
                    if ($stateParams.alert_id) {

                        var alert = dataShare.getData();
                        if (alert) {
                            self.populateData(alert);
                        } else {
                            $scope.loading = true;
                            console.log($stateParams.alert_id);
                            var ajax = notifyHelper.getPriceAlert($stateParams.alert_id);
                            ajax.then(function (data) {
                                console.log(data);
                                $scope.loading = false;
                                self.populateData(data);
                                $scope.$broadcast('scroll.infiniteScrollComplete');
                                $scope.$broadcast('scroll.refreshComplete');
                            });
                        }

                    } else {
                        toast.showShortBottom('Invalid URL');
                        urlHelper.openHomePage();
                    }
                };
                $scope.openItem = function () {
                    if (window.plugins) {
                        window.open($scope.alert.url, '_system');
                    } else {
                        window.open($scope.alert.url);
                    }
                };
                $scope.options = {
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
                $scope.removePriceAlert = function () {
                    var item = $scope.alert;
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Remove Price Alerts?',
                        template: 'Are You Sure You Want To Remove This Price Alert'
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            var ajax = notifyHelper.stopPriceAlert(item._id, $localStorage.user.id);
                            ajax.then(function () {
                                toast.showShortBottom('Price Alert Removed');
                            });
                        } else {
                        }
                    });
                };
                $scope.data = {};
                $scope.setPriceAlertLimit = function () {
                    var item = $scope.alert;
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Set Price Limit',
                        template: '<input type="number" ng-model="data.limit">',
                        subTitle: 'Price Below Which You Want To Get Alert Notification',
                        scope: $scope
                    });
                    confirmPopup.then(function (res) {
                        if (res == 1) {
                            if ($scope.data.limit * 1 <= 0) {
                                toast.showShortBottom('Price Limit Cannot Be Empty');
                            } else {
                                if (res) {
                                    var ajax = notifyHelper.setPriceLimit(item._id, $localStorage.user.id, $scope.data.limit);
                                    ajax.then(function () {
                                        toast.showShortBottom('Price Limit Set');
                                    });
                                } else {
                                }
                            }
                        }
                    });
                };
                $scope.startNotification = function () {
                    var item = $scope.alert;
                    var ajax = notifyHelper.setPriceLimit(item._id, $localStorage.user.id, 'remove');
                    ajax.then(function () {
                        toast.showShortBottom('Price Alert Notification Started');
                        item.stopped_notify = false;
                    });
                };
                $scope.stopNotification = function () {
                    var item = $scope.alert;
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Stop Notification?',
                        template: 'You Wont Recieve Any More Notification On Your Mobile For Price Drops. Are you sure you want to do this?'
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            var ajax = notifyHelper.setPriceLimit(item._id, $localStorage.user.id, -1);
                            ajax.then(function () {
                                toast.showShortBottom('Price Alert Notification Stopped');
                                item.stopped_notify = true;
                            });
                        } else {
                        }
                    });

                };
                $scope.openProduct = function (product) {
                    var id = product._id;
                    console.log('open product ' + id);
                    if (!product.img) {
                        product.img = product.image;
                    }
                    dataShare.broadcastData(angular.copy(product), 'product_open');
                    urlHelper.openProductPage(id);
                };
                $scope.show_footer_menu = true;
                var self = this;
                self.footer_ele = false;
                $scope.scroll = function () {
                    if (!self.footer_ele) {
                        self.footer_ele = angular.element(document.getElementById('fixed_footer'));
                    }
                    var pos = $ionicPosition.offset(self.footer_ele);
                    var height = $window.innerHeight;
                    if (pos.top + 50 > height) {
                        $scope.show_footer_menu = true;
                    } else {
                        $scope.show_footer_menu = false;
                    }
                };
                $scope.show_main_image_in_more = true;
                $scope.$on('image_loaded_more_images0', function () {
                    $scope.show_main_image_in_more = false;
                    $timeout(function () {
                        $ionicSlideBoxDelegate.update();
                    });
                });
                $scope.showZoom = function (index) {
                    var more_images = $scope.alert.more_images;
                    var img = $scope.alert.img;
                    var final_images = [];
                    final_images.push(img);
                    if (more_images) {
                        final_images = [];
                        for (var i = 0; i < more_images.length; i++) {
                            final_images.push(more_images[i]);
                        }
                    }
                    if (index * 1 === -1) {
                        $scope.zoom_main_image = img;
                    } else {
                        $scope.zoom_main_image = more_images[index * 1];
                    }
                    $scope.zoom_images = final_images;
                    $scope.zoom_height = ($window.innerHeight - 50) + "px";
                    $scope.zoom_modal.show();
                    $timeout(function () {
                        angular.element(document.querySelector('.zoom_similar')).attr('style', 'width:' + (final_images.length * 52) + "px");
                    });
                };
                $scope.closeZoom = function () {
                    $scope.zoom_modal.hide();
                }
                $scope.openZoomTap = function (index) {
                    var more_images = $scope.zoom_images;
                    $scope.zoom_main_image = more_images[index];
                    $ionicScrollDelegate.$getByHandle('zoom-scroll').zoomBy(1, true);
                };
                $ionicModal.fromTemplateUrl('template/partial/zoom.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.zoom_modal = modal;
                });
                $scope.$on('$destroy', function () {
                    $scope.zoom_modal.remove();
                });
            }
        ]);