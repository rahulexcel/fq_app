profileMod.controller('ProfileFollowingCtrl',
        ['$scope', '$localStorage', 'toast',
            function ($scope, $localStorage) {
                $scope.$on('user_info', function () {
                    $scope.following_users = $scope.$parent.user.following;
                    var wishlists = $scope.$parent.user.lists_their;
                    if (wishlists) {
                        for (var i = 0; i < wishlists.length; i++) {
                            wishlists[i].is_following = true;
                        }
                    }
                    $scope.lists_their = wishlists;
                    if ($scope.$parent.user._id === $localStorage.user.id) {
                        $scope.me = true;
                    }
                });
                $scope.following_users = $scope.$parent.user.following;
                var wishlists = $scope.$parent.user.lists_their;
                if (wishlists) {
                    for (var i = 0; i < wishlists.length; i++) {
                        wishlists[i].is_following = true;
                    }
                }
                $scope.lists_their = wishlists;
                $scope.me = false;
                if ($scope.$parent.user._id === $localStorage.user.id) {
                    $scope.me = true;
                }

            }
        ]);