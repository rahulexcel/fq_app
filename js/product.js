var productMod = angular.module('ProductMod', ['ionic', 'ProductService', 'ServiceMod']);

productMod.controller('ProductCtrl',
        ['$scope', '$stateParams', 'productHelper', 'dataShare', 'wishlistHelper', 'toast', '$localStorage',
            function ($scope, $stateParams, productHelper, dataShare, wishlistHelper, toast, $localStorage) {
                $scope.product_loading = true;
                $scope.product = false;
                if ($stateParams.product_id) {
                    var product_id = $stateParams.product_id;
                    var ajax = productHelper.fetchProduct(product_id);
                    ajax.then(function (data) {
                        $scope.product = data;
                        $scope.product_loading = false;
                    }, function () {

                    });
                }
                $scope.$on('product_open', function () {
                    var data = dataShare.getData();
                    console.log('product open event');
                    console.log(data);
                    $scope.product = data;
                    $scope.product_loading = false;
                })
                $scope.buy = function (product) {
                    if (window.plugins) {
                        window.open(product.href, '_system');
                    } else {
                        window.open(product.href);
                    }
                }
                $scope.wishlist = function () {
                    $scope.product.wishlist = 2;
                    var ajax = wishlistHelper.add($scope.product._id);
                    ajax.then(function () {
                        $scope.product.wishlist = 1;
                        toast.showShortBottom($scope.product.name + " added to your wishlist!!");
                    }, function (data) {
                        if (data.login == 1) {
                            if (!$localStorage.previous) {
                                $localStorage.previous = {};
                            }
                            $localStorage.previous.state = {
                                function: 'wishlist',
                                param: angular.copy($scope.product)
                            };
                        }
                        $scope.product.wishlist = false;
                    });
                }
            }
        ]);