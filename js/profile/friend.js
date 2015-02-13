profileMod.controller('ProfileFriendCtrl',
        ['$scope', '$localStorage', 'toast', '$location', 'friendHelper',
            function ($scope, $localStorage, toast, $location, friendHelper) {
                $scope.$on('user_info', function () {
                    $scope.friends = $scope.$parent.user.friends;
                    if ($scope.$parent.user._id === $localStorage.user.id) {
                        $scope.me = true;
                    }
                });
                $scope.friends = $scope.$parent.user.friends;
                $scope.me = false;
                if ($scope.$parent.user._id === $localStorage.user.id) {
                    $scope.me = true;
                }

                $scope.hasMore = true;
                $scope.page = 0;
                $scope.loadMoreFriends = function () {
                    var ajax = friendHelper.loadMoreFriends($scope.$parent.user._id, $scope.page++);
                    ajax.then(function (data) {
                        if (data.length > 0) {
                            for (var i = 0; i < data.length; i++) {
                                $scope.friends.push(data[i]);
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