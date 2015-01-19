profileMod.controller('ProfilePinCtrl',
        ['$scope', '$localStorage', 'toast', '$timeout', '$location',
            function ($scope, $localStorage, toast, $timeout, $location) {
                var user_info_loaded = false;
                $scope.$on('user_info', function () {
                    $scope.pins = $scope.$parent.user.pins;
                    user_info_loaded = true;
                    $timeout(function () {
                        if (user_info_loaded)
                            $scope.pin_status.showMore = true;
                    }, 1000);
                })
                if ($scope.$parent.user) {
                    user_info_loaded = true;
                }
                $scope.pins = $scope.$parent.user.pins;
                $timeout(function () {
                    if (user_info_loaded)
                        $scope.pin_status.showMore = true;
                }, 1000);
                $scope.me = false;
                if ($scope.$parent.user._id == $localStorage.user.id) {
                    $scope.me = true;
                }
                $scope.viewItem = function (item_id, list_id) {
                    $location.path('/app/item/' + item_id + "/" + list_id);
                }
                $scope.pin = function (item_id) {
                    if (!$localStorage.user.id) {
                        $localStorage.previous.state = {
                            function: 'pin'
                        };
                        toast.showShortBottom('SignUp/Login To Pin Item');
                    } else {
                        $scope.wishlist_product.product = false;
                        $scope.wishlist_product.new_item = false;
                        $scope.wishlist_product.item = item_id;
                        $scope.$parent.showWishlist();
                    }
                };

            }
        ]);