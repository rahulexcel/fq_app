profileMod.controller('ProfileAlertsCtrl',
        ['$scope', '$localStorage', 'toast', 'notifyHelper', '$ionicLoading', '$ionicPopup', '$ionicListDelegate', '$location', 'dataShare',
            function ($scope, $localStorage, toast, notifyHelper, $ionicLoading, $ionicPopup, $ionicListDelegate, $location, dataShare) {
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
                    var ajax = notifyHelper.getPriceAlerts($scope.page);
                    ajax.then(function (data) {
                        if (data.length === 0) {
                            $scope.hasMore = false;
                        }
                        $scope.alerts = $scope.alerts.concat(data);
                        $ionicLoading.hide();
                    }, function () {
                        $ionicLoading.hide();
                    });
                };
                $scope.loadMore();
                $scope.openAlert = function (item) {
                    dataShare.broadcastData(item, 'item');
                    $location.path('/app/alert/' + item._id);
                };
                $scope.openItem = function (product) {
                    if (window.plugins) {
                        window.open(product.url, '_system');
                    } else {
                        window.open(product.url);
                    }
                };
                $scope.removePriceAlert = function (item, index) {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Remove Price Alerts?',
                        template: 'Are You Sure You Want To Remove This Price Alert'
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            var ajax = notifyHelper.stopPriceAlert(item._id, $localStorage.user.id);
                            ajax.then(function () {
                                var alerts = $scope.alerts;
                                alerts = alerts.slice(0, index).concat(alerts.slice(index + 1));
                                $scope.alerts = alerts;
                                $ionicListDelegate.closeOptionButtons();
                                toast.showShortBottom('Price Alert Removed');
                            });
                        } else {
                        }
                    });
                };
            }
        ]);