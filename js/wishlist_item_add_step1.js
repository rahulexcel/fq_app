var wishlistItemAddMod = angular.module('WishlistItemAddMod', ['ServiceMod', 'angularFileUpload', 'ngStorage', 'ionic', 'WishlistService', 'MapService']);

wishlistItemAddMod.controller('WishlistItemAddCtrlStep1',
        ['$scope', '$location', 'dataShare',
            function ($scope, $location, dataShare) {
                if (ionic.Platform.isWebView()) {
                    $scope.is_mobile = true;
                }
                $scope.$on('logout_event', function () {
                    $location.path('/app/signup');
                });

                $scope.type = function (type) {
                    var list_id = dataShare.getData();
                    if (list_id) {
                        $location.path('/app/wishlist_item_add_step2/' + type + '/' + list_id);
                    } else {
                        $scope.wishlist_product.product = false;
                        $scope.wishlist_product.item = false;
                        $scope.wishlist_product.new_item = true;
                        $scope.showWishlist(type);
                    }
                };
            }
        ]);