var alertMod = angular.module('AlertMod', ['ServiceMod']);

alertMod.controller('AlertCtrl',
        ['$scope', '$localStorage', 'toast', '$stateParams', '$location', 'dataShare', '$ionicSlideBoxDelegate', 'productHelper', 'timeStorage', 'notifyHelper', '$ionicPopup',
            function ($scope, $localStorage, toast, $stateParams, $location, dataShare, $ionicSlideBoxDelegate, productHelper, timeStorage, notifyHelper, $ionicPopup) {
                var self = this;
                self.normalizeData = function (data) {
                    if (data) {
                        var newData = {};
                        for (var i = 0; i < data.length; i++) {
                            var row = data[i];
                            if (row.time && row.price * 1 > 0) {
                                var datetime = new Date(row.time * 1000);
                                var price = row.price;
                                var x = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
                                var key = datetime.getDate() + "-" + x[datetime.getMonth()];
                                if (newData[key] && price < newData[key]) {
                                    newData[key] = price;
                                } else {
                                    newData[key] = price;
                                }
                            }
                        }
                        return newData;
                    } else {
                        return {};
                    }
                };
                $scope.fetchLatest = function (href) {
                    if (!href) {
                        return;
                    }
                    self.fetch_latest_done = true;
                    var ajax2 = productHelper.fetchLatest(href);
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
                    $scope.fetchLatest(alert.url);
                };
                if ($stateParams.alert_id) {

                    var alert = dataShare.getData();
                    if (alert) {
                        self.populateData(alert);
                    } else {
                        $scope.loading = true;
                        var ajax = notifyHelper.getPriceAlert($stateParams.alert_id);
                        ajax.then(function (data) {
                            $scope.loading = false;
                            self.populateData(data);
                        });
                    }

                } else {
                    toast.showShortBottom('Invalid URL');
                    $location.path('/app/home');
                }
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
                        showLabel: true,
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

                $scope.setPriceAlertLimit = function () {
                    var item = $scope.alert;
                    if (item.limit * 1 <= 0) {
                        toast.showShortBottom('Price Limit Cannot Be Empty');
                    } else {

                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Set Price Limit?',
                            template: 'You Will Get Price Drop Notification Only When Price Falls Below Rs: ' + item.limit
                        });
                        confirmPopup.then(function (res) {
                            if (res) {
                                var ajax = notifyHelper.setPriceLimit(item._id, $localStorage.user.id, item.limit);
                                ajax.then(function () {
                                    toast.showShortBottom('Price Limit Set');
                                });
                            } else {
                            }
                        });
                    }
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
            }
        ]);