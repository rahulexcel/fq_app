profileMod.controller('ProfileAlertsCtrl',
        ['$scope', '$localStorage', 'toast', 'notifyHelper', '$ionicLoading', '$ionicPopup', '$ionicListDelegate', 'dataShare', 'urlHelper',
            function ($scope, $localStorage, toast, notifyHelper, $ionicLoading, $ionicPopup, $ionicListDelegate, dataShare, urlHelper) {
                var self = this;
                $scope.$on('doRefresh', function () {
                    $scope.doRefresh();
                });
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
                    $scope.loading = true;
                    $scope.page = $scope.page + 1;
                    var ajax = notifyHelper.getPriceAlerts($scope.page);
                    ajax.then(function (data) {
                        $scope.$emit('scroll.refreshComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        if (data.length === 0) {
                            $scope.hasMore = false;
                        }
                        $scope.alerts = $scope.alerts.concat(data);
                        $scope.loading = false;
                    }, function () {
                        $scope.$emit('scroll.refreshComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.loading = false;
                    });
                };
                $scope.loadMore();
                $scope.openAlert = function (item) {
                    dataShare.broadcastData(item, 'item');
                    urlHelper.openAlertPage(item._id);
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