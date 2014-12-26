var productMod = angular.module('ProductMod', ['ionic', 'ProductService']);

productMod.controller('ProductCtrl',
        ['$scope', '$stateParams', 'productHelper',
            function ($scope, $stateParams, productHelper) {
                $scope.product_loading = true;
                $scope.product = false;
                if ($stateParams.product_id) {
                    var product_id = $stateParams.product_id;
                    var ajax = productHelper.fetchProduct(product_id);
                    ajax.then(function (data) {
                        $scope.product = data;
                        $scope.product_loading = false;
                    });
                }
                $scope.buy = function (product) {
                    if (window.plugins) {
                        window.open(product.url, '_system');
                    } else {
                        window.open(product.url);
                    }
                }
                $scope.buyVariant = function (variant) {
                    if (window.plugins) {
                        window.open(variant.url, '_system');
                    } else {
                        window.open(variant.url);
                    }
                }
            }
        ]);