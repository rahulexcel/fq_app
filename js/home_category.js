var homecatMod = angular.module('HomeCatMod', ['ServiceMod']);

homecatMod.controller('HomeCatCtrl',
        ['$scope', 'friendHelper', 'ajaxRequest', 'CDN', '$localStorage', '$location',
            function ($scope, friendHelper, ajaxRequest, CDN, $localStorage, $location) {
                $scope.currentState = {};
                $scope.product_loading = false;
                $scope.showProducts = false;
                $scope.page = 0;
                $scope.products = [];
                var self = this;
                $scope.nextPage = function () {
                    console.log('neexxx');
                    $scope.page++;
                    self.fetchProduct();
                };
                $scope.openProduct = function (product) {
                    var id = product._id;
                    console.log('open product ');
                    $location.path('/app/product/' + id);
//                    product = angular.copy(product);
//                    product.cat_name = $scope.current_category.name;
//                    dataShare.broadcastData(product, 'product_open');
                };
                $scope.refreshCategory = function () {
                    $scope.page = 0;
                    $scope.products = [];
                    self.fetchProduct();
                };
                var self = this;
                self.women = true;
                if ($localStorage.latest_show && $localStorage.latest_show == 'men') {
                    self.women = false;
                }
                $scope.$on('show_women', function () {
                    self.women = true;
                    $scope.page = 0;
                    $scope.products = [];
                    self.fetchProduct();
                });
                $scope.$on('show_men', function () {
                    self.women = false;
                    $scope.page = 0;
                    $scope.products = [];
                    self.fetchProduct();
                });
                self.fetchProduct = function () {
                    var page = $scope.page;
                    $scope.product_loading = true;
                    var ajax = friendHelper.home_latest(page, self.women);
                    ajax.then(function (data) {
                        $scope.product_loading = false;
                        if (data.length === 0) {
                            $scope.showProducts = false;
                        } else {
                            $scope.showProducts = true;
                        }
                        var products = $scope.products;
                        for (var i = 0; i < data.length; i++) {
                            var image = data[i]._id;
                            //data[i].img = CDN.cdnize(ajaxRequest.url('v1/picture/images/' + image));
                            products.push(data[i]);
                        }
                        $scope.products = products;
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }, function () {
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.product_loading = false;
                        $scope.showProducts = false;
                    });
                };
                self.fetchProduct();
                $scope.wishlist = function (product, $event) {
                    if (window.analytics) {
                        window.analytics.trackEvent('Pin', 'Latest Page', $location.path());
                    }
                    $event.preventDefault();
                    $event.stopPropagation();
                    if ($localStorage.user.id) {
                        $scope.wishlist_product.item = false;
                        $scope.wishlist_product.new_item = false;
                        $scope.wishlist_product.product = product;
                        $scope.$parent.showWishlist();
                    } else {
                        toast.showShortBottom('SignUp To Add Item To Wishlist');
                        if (!$localStorage.previous) {
                            $localStorage.previous = {};
                        }
                        $localStorage.previous.state = {function: 'wishlist',
                            param: angular.copy(product),
                            category: angular.copy($scope.currentState)
                        };
                        $location.path('/app/signup');
                    }
                };
            }
        ]);