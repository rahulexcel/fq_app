var wishlistItemAddMod = angular.module('WishlistItemAddMod', ['ServiceMod', 'angularFileUpload', 'ngStorage', 'ionic', 'WishlistService', 'MapService', 'UrlService']);

wishlistItemAddMod.controller('WishlistItemAddCtrlStep1',
        ['$scope', 'dataShare', 'urlHelper',
            function ($scope, dataShare, urlHelper) {
                if (ionic.Platform.isWebView()) {
                    $scope.is_mobile = true;
                }
                $scope.$on('logout_event', function () {
                    urlHelper.openSignUp();
                });

                $scope.type = function (type) {
                    var list_id = dataShare.getData();
                    if (list_id) {
                        urlHelper.openWishlistAddStep2(type, list_id);
                    } else {
//                        $scope.wishlist_product.product = false;
//                        $scope.wishlist_product.item = false;
//                        $scope.wishlist_product.new_item = true;
//                        $scope.showWishlist(type);

                        urlHelper.openWishlistAddStep2(type, -1);
                    }
                };
            }
        ]);