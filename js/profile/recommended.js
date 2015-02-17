profileMod.controller('ProfileRecommendedCtrl',
        ['$scope', '$localStorage', 'toast', '$location', 'friendHelper', '$ionicLoading',
            function ($scope, $localStorage, toast, $location, friendHelper, $ionicLoading) {
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
                        $scope.top_users = data;
                        $ionicLoading.hide();
                        var ajax2 = friendHelper.top_lists($scope.page);
                        ajax2.then(function (data2) {
                            for (var i = 0; i < data2.length; i++) {
                                data2[i].is_following = false;
                            }
                            $scope.top_lists = data2;
                        });
                    }, function () {
                    });
                };
                $scope.loadMore();

            }
        ]);