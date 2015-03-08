profileMod.controller('ProfileListMineCtrl',
        ['$scope', '$localStorage',
            function ($scope, $localStorage) {

                $scope.$on('user_info', function () {
                    if ($scope.$parent.user._id === $localStorage.user.id) {
                        $scope.me = true;
                    }
                    var wishlists = $scope.$parent.user.lists_mine;
                    if (wishlists) {
                        var new_wishlists = [];
                        for (var i = 0; i < wishlists.length; i++) {
                            if ($scope.me) {
                                wishlists[i].can_edit = true;
                            } else {
                                if (wishlists[i].type === 'public') {
                                    new_wishlists.push(wishlists[i]);
                                }
                            }
                        }
                        if (!$scope.me) {
                            wishlists = new_wishlists;
                        }
                    }
                    $scope.wishlist_mine = wishlists;
                    var wishlists = $scope.$parent.user.lists_shared;
                    $scope.wishlist_shared = wishlists;
                    if (!$scope.me) {
                        $scope.wishlist_shared = [];
                    }
                });
                $scope.me = false;
                if ($scope.$parent.user._id === $localStorage.user.id) {
                    $scope.me = true;
                }
                var wishlists = $scope.$parent.user.lists_mine;
                if (wishlists) {
                    var new_wishlists = [];
                    for (var i = 0; i < wishlists.length; i++) {
                        if ($scope.me) {
                            wishlists[i].can_edit = true;
                        } else {
                            if (wishlists[i].type === 'public') {
                                new_wishlists.push(wishlists[i]);
                            }
                        }
                    }
                    if (!$scope.me) {
                        wishlists = new_wishlists;
                    }
                }
                $scope.wishlist_mine = wishlists;
                var wishlists = $scope.$parent.user.lists_shared;
                $scope.wishlist_shared = wishlists;
                if (!$scope.me) {
                    $scope.wishlist_shared = [];
                }
            }
        ]);