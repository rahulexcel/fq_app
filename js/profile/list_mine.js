profileMod.controller('ProfileListMineCtrl',
        ['$scope', '$localStorage',
            function ($scope, $localStorage) {

                $scope.$on('user_info', function () {
                    if ($scope.$parent.user._id === $localStorage.user.id) {
                        $scope.me = true;
                    }
                    var wishlists = $scope.$parent.user.lists_mine;
                    if (wishlists) {
                        for (var i = 0; i < wishlists.length; i++) {
                            if ($scope.me)
                                wishlists[i].can_edit = true;
                        }
                    }
                    $scope.wishlist_mine = wishlists;
                });
                $scope.me = false;
                if ($scope.$parent.user._id === $localStorage.user.id) {
                    $scope.me = true;
                }
                var wishlists = $scope.$parent.user.lists_mine;
                if (wishlists) {
                    for (var i = 0; i < wishlists.length; i++) {
                        if ($scope.me)
                            wishlists[i].can_edit = true;
                    }
                }
                $scope.wishlist_mine = wishlists;
            }
        ]);