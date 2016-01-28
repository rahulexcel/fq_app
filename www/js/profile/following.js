profileMod.controller('ProfileFollowingCtrl',
        ['$scope', '$localStorage', 'toast',
            function ($scope, $localStorage) {
                $scope.$on('doRefresh', function () {
                    $scope.$emit('getUserData');
                });
                $scope.$on('user_info', function () {
                    var following_users = $scope.$parent.user.following;
                    var i = 0;
                    if (following_users) {
                        for (i = 0; i < following_users.length; i++) {
                            following_users[i].is_following = true;
                        }
                    }
                    $scope.following_users = following_users;

                    var wishlists = $scope.$parent.user.lists_their;
                    if (wishlists) {
                        for (i = 0; i < wishlists.length; i++) {
                            wishlists[i].is_following = true;
                        }
                    }
                    $scope.lists_their = wishlists;
                    if ($scope.$parent.user._id === $localStorage.user.id) {
                        $scope.me = true;
                    }
                });
                var following_users = $scope.$parent.user.following;
                if (following_users) {
                    for (i = 0; i < following_users.length; i++) {
                        following_users[i].is_following = true;
                    }
                }
                $scope.following_users = following_users;
                var wishlists = $scope.$parent.user.lists_their;
                if (wishlists) {
                    for (i = 0; i < wishlists.length; i++) {
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