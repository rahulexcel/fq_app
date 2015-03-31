profileMod.controller('ProfileAlertsCtrl',
        ['$scope', '$localStorage', 'toast', 'notifyHelper', '$ionicLoading',
            function ($scope, $localStorage, toast, notifyHelper, $ionicLoading) {
                var self = this;
                $scope.$on('user_info', function () {
                    if ($scope.$parent.user._id === $localStorage.user.id) {
                        $scope.me = true;
                    }
                });
                $scope.me = false;
                if ($scope.$parent.user._id === $localStorage.user.id) {
                    $scope.me = true;
                }
                $scope.hasMore = true;
                $scope.page = -1;
                $scope.alerts = [];
                $scope.doRefresh = function () {
                    $scope.alerts = [];
                    $scope.page = -1;
                    $scope.loadMore();
                };
                $scope.loadMore = function () {
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    $scope.page = $scope.page + 1;
                    var ajax = notifyHelper.getAlerts($scope.page);
                    ajax.then(function (data) {
                        if (data.length === 0) {
                            $scope.hasMore = false;
                        }
                        for (var i = 0; i < data.length; i++) {
                            var row = data[i];
                            var price_history_data = row.price_history_data;
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
                            console.log(price_history_data);
                            console.log(chart_data);
                            console.log(key_points);
                            row.data = chart_data;
                            if (key_points === 0) {
                                row.show_chart = false;
                            } else {
                                row.show_chart = true;
                            }
                            data[i] = row;
                        }
                        $scope.alerts = $scope.alerts.concat(data);
                        $ionicLoading.hide();
                    }, function () {
                        $ionicLoading.hide();
                    });
                };
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
                $scope.loadMore();
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
                        labelInterpolationFnc: function (x) {
                            return 'Rs: ' + x;
                        }
                    }
                };
                $scope.openItem = function (product) {
                    if (window.plugins) {
                        window.open(product.href, '_system');
                    } else {
                        window.open(product.href);
                    }
                };
                $scope.removePriceAlert = function (item) {
                    var ajax = notifyHelper.stopPriceAlert(item._id, $localStorage.user.id);
                    ajax.then(function () {
                        toast.showProgress('Price Alert Removed');
                    });
                };
                $scope.setPriceAlertLimt = function (item) {
                    var ajax = notifyHelper.setPriceLimit(item._id, $localStorage.user.id, item.limit);
                    ajax.then(function () {
                        toast.showProgress('Price Limit Set');
                    });
                };
                $scope.stopNotification = function (item) {
                    var ajax = notifyHelper.setPriceLimit(item._id, $localStorage.user.id, -1);
                    ajax.then(function () {
                        toast.showProgress('Price Notification Stopped');
                    });
                };
            }
        ]);