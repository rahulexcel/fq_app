profileMod.controller('ProfilePinCtrl',
        ['$scope', '$localStorage', 'toast', 'wishlistHelper', '$location',
            function ($scope, $localStorage, toast, wishlistHelper, $location) {
                $scope.$on('user_info', function () {
                    $scope.pins = $scope.$parent.user.pins;
                })
                $scope.pins = $scope.$parent.user.pins;
                $scope.me = false;
                if ($scope.$parent.user._id == $localStorage.user.id) {
                    $scope.me = true;
                }
                $scope.viewItem = function (item_id, list_id) {
                    $location.path('/app/item/' + item_id + "/" + list_id);
                }
                $scope.pin = function (item_id, list_id) {
                    if (!$localStorage.user.id) {
                        $localStorage.previous.state = {
                            function: 'pin'
                        };
                        toast.showShortBottom('SignUp/Login To Pin Item');
                    } else {
                        $scope.wishlist_product.product = false;
                        $scope.wishlist_product.new_item = false;
                        $scope.wishlist_product.item = $scope.item.item_id;
                        $scope.$parent.showWishlist();
                    }
                };

            }
        ]);