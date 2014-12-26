var categoryMod = angular.module('CategoryMod', ['CategoryService', 'WishlistService', 'ionic']);

categoryMod.controller('CategoryCtrl',
        ['$scope', 'categoryHelper', '$ionicNavBarDelegate', 'toast', '$ionicScrollDelegate', 'wishlistHelper', '$stateParams',
            function ($scope, categoryHelper, $ionicNavBarDelegate, toast, $ionicScrollDelegate, wishlistHelper, $stateParams) {

                if ($stateParams.cat_id && $stateParams.sub_cat_id) {
                    $scope.current_category = {
                        name: $stateParams.name,
                        cat_id: $stateParams.cat_id,
                        sub_cat_id: $stateParams.sub_cat_id,
                    };
                }
                var products = [];

                $scope.showProducts = true;
                $scope.showSortBy = false;
                $scope.showFilter = false;

                $scope.products = products;
                $scope.next_page_url = false;
                $scope.page = 0;


                $scope.currentState = {};

                $scope.showProductsFn = function () {
                    $scope.showProducts = true;
                    $scope.showSortBy = false;
                    $scope.showFilter = false;
                    $ionicScrollDelegate.scrollTop();
                }
                $scope.showSortByFn = function () {
                    $scope.showProducts = false;
                    $scope.showSortBy = true;
                    $scope.showFilter = false;
                    $ionicScrollDelegate.scrollTop();
                }
                $scope.showFiltersFn = function () {
                    $scope.showProducts = false;
                    $scope.showSortBy = false;
                    $scope.showFilter = true;
                    $ionicScrollDelegate.scrollTop();
                }
                $scope.open = function (obj) {
                    if (!obj.open) {
                        obj.open = true;
                    } else {
                        obj.open = !obj.open;
                    }
                }

                $scope.removeFilter = function (filter) {
                    var url = filter.param;
                    $scope.product_loading = true;
                    var state = $scope.currentState;
                    var filters = state.filters;
                    var new_filters = [];

                    for (var i = 0; i < filters.length; i++) {
                        if (filters[i].url != url) {
                            new_filters.push(filters[i]);
                        }
                    }
                    $scope.currentState.filters = new_filters;
                    var req = categoryHelper.fetchProduct(state);
                    req.then(function (ret) {
                        $scope.product_loading = false;
                        if (ret.products.length == 0) {
                            toast.showShortBottom('Product Not Found Matching Current Filter');
                        }
                        $scope.update(ret, true);
                        $scope.showProductsFn();
                    });
                }

                $scope.doFilter = function (filter) {
                    var url = filter.param;
                    var name = filter.name;
                    $scope.product_loading = true;
                    var state = $scope.currentState;
                    if (!state.filters) {
                        state.filters = [];
                    }
                    state.filters.push({
                        name: name,
                        param: url
                    });
                    var req = categoryHelper.fetchProduct(state);
                    req.then(function (ret) {
                        $scope.product_loading = false;
                        if (ret.products.length == 0) {
                            toast.showShortBottom('Product Not Found Matching Current Filter');
                        }
                        $scope.update(ret, true);
                        $scope.showProductsFn();
                    });
                }
                $scope.doSort = function (sort) {
                    var url = sort.url;
                    $scope.product_loading = true;

                    var state = $scope.currentState;
                    state.sortby = url;

                    var req = categoryHelper.fetchProduct(state);
                    req.then(function (ret) {
                        $scope.product_loading = false;
                        $scope.update(ret, true);
                        $scope.showProductsFn();
                    });
                }

                $scope.$watch('current_category', function (cat) {
                    console.log(cat);
                    if (cat) {
                        $scope.currentState = {};
                        $scope.currentState = cat;
                        $scope.currentState.filters = [];
                        $ionicNavBarDelegate.title(cat.name);
                        var products = [];
                        $scope.products = products;
                        $scope.product_loading = true;
                        var req = categoryHelper.fetchProduct({
                            cat_id: cat.cat_id,
                            sub_cat_id: cat.sub_cat_id
                        });

                        req.then(function (ret) {
                            $scope.product_loading = false;
                            $scope.update(ret);
                        });
                    }
                });
                $scope.nextPage = function () {
                    if ($scope.page) {
                        $scope.product_loading = true;
                        var state = $scope.currentState;
                        state.page++;
                        var req = categoryHelper.fetchProduct(state);
                        req.then(function (ret) {
                            $scope.product_loading = false;
                            $scope.update(ret, true);
                            if (ret.products.length > 0)
                                $scope.$broadcast('scroll.infiniteScrollComplete');
                        });
                    }
                }

                $scope.update = function (ret, append) {
                    $scope.currentState.page = ret.page;
                    console.log(ret.products.length + 'products');
                    if ($scope.products && append) {
                        var products = $scope.products;
                        for (var i = 0; i < ret.products.length; i++) {
                            products.push(ret.products[i]);
                        }
                        $scope.products = products;
                    } else {
                        $scope.products = ret.products;
                    }
                    $scope.next_page_url = ret.page;
                    $scope.sortBy = ret.sortBy;
                    $scope.filters = ret.filters;
                }
                $scope.wishlist = function (product) {
                    product.wishlist = 1;
                    var ajax = wishlistHelper.add(product._id);
                    ajax.then(function () {
                        product.wishlist = 2;
                    }, function () {
                        if (!$localStorage.prevous) {
                            $localStorage.prevous = {};
                        }
                        $localStorage.prevous;
                        product.wishlist = false;
                    });
                }

            }
        ]);