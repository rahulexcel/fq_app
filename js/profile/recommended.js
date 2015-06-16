profileMod.controller('ProfileRecommendedCtrl',
        ['$scope', '$localStorage', 'toast', 'friendHelper', '$ionicLoading',
            function ($scope, $localStorage, toast, friendHelper, $ionicLoading) {
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
                $scope.top_users = [];
                $scope.top_lists = [];
                $scope.doRefresh = function () {
                    $scope.top_users = [];
                    $scope.top_lists = [];
                    $scope.page = -1;
                    $scope.loadMore();
                    $scope.loadMoreList();
                };
                $scope.loadMore = function () {
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    $scope.page = $scope.page + 1;
                    var ajax = friendHelper.top_users($scope.page);
                    ajax.then(function (data) {
                        if (data.length === 0) {
                            $scope.hasMore = false;
                        }
                        for (var i = 0; i < data.length; i++) {
                            data[i].is_following = false;
                        }
                        if (data.length !== 0) {
                            $scope.top_users = data;
                        } else {
                            if ($scope.page > 1)
                                toast.showShortBottom('No More Users Found');
                        }
                        $ionicLoading.hide();
                        $scope.$emit('scroll.refreshComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                    }, function () {
                        $scope.$emit('scroll.refreshComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                    });
                };
                $scope.loadMoreList = function () {
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    $scope.page = $scope.page + 1;
                    var ajax2 = friendHelper.top_lists($scope.page);
                    ajax2.then(function (data2) {
                        if (data2.length === 0) {
                            $scope.hasListMore = false;
                        }
                        for (var i = 0; i < data2.length; i++) {
                            data2[i].is_following = false;
                        }
                        if (data2.length !== 0) {
                            $scope.top_lists = data2;
                        } else {
                            if ($scope.page > 1)
                                toast.showShortBottom('No More Lists Found');
                        }
                        $ionicLoading.hide();
                    });
                };
                $scope.loadMore();
                $scope.loadMoreList();

            }
        ]);