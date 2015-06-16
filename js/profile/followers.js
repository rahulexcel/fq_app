profileMod.controller('ProfileFollowerCtrl',
        ['$scope', '$localStorage', 'friendHelper',
            function ($scope, $localStorage, friendHelper) {
                $scope.$on('doRefresh', function () {
                    $scope.$emit('getUserData');
                });
                $scope.$on('user_info', function () {
                    var followers = $scope.$parent.user.followers;
                    if (followers) {
                        for (var i = 0; i < followers.length; i++) {
                            if (followers[i])
                                followers[i].is_following = false;
                        }
                    }
                    $scope.followers = followers;
                    if ($scope.$parent.user._id === $localStorage.user.id) {
                        $scope.me = true;
                    }
                });
                var followers = $scope.$parent.user.followers;
                if (followers) {
                    for (var i = 0; i < followers.length; i++) {
                        if (followers[i])
                            followers[i].is_following = false;
                    }
                }
                $scope.followers = followers;
                $scope.me = false;
                if ($scope.$parent.user._id === $localStorage.user.id) {
                    $scope.me = true;
                }

                $scope.hasMore = true;
                $scope.page = 0;
                $scope.loadMoreFollowers = function () {
                    $scope.page = $scope.page + 1;
                    var ajax = friendHelper.loadMoreFollowers($scope.$parent.user._id, $scope.page);
                    ajax.then(function (data) {
                        if (data.length > 0) {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i])
                                    $scope.followers.push(data[i]);
                            }
                        } else {
                            $scope.hasMore = false;
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }, function () {
                        $scope.hasMore = false;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                };
            }
        ]);