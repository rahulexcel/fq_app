var categoryMod = angular.module('CategoryMod', ['CategoryService', 'WishlistService', 'ionic']);

categoryMod.directive('scrollWatch', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var start = scope.$eval(attrs.scrolling) || 0;

            element.bind('scroll', function (e) {
                if (e.detail.scrollTop >= start) {
                    start = e.detail.scrollTop;
                    scope.scroll_direction.direction = -1;
                    scope.$evalAsync();
                    console.log('scroll to bottom');
                } else {
                    scope.scroll_direction.direction = 1;
                    scope.$evalAsync();
                    console.log('scroll to top');
                }
            });
        }
    }
});
categoryMod.controller('CategoryCtrl',
        ['$scope', 'categoryHelper', '$ionicHistory', 'toast', '$ionicScrollDelegate', 'wishlistHelper', '$stateParams', '$localStorage', '$rootScope', '$location', 'dataShare',
            function ($scope, categoryHelper, $ionicHistory, toast, $ionicScrollDelegate, wishlistHelper, $stateParams, $localStorage, $rootScope, $location, dataShare) {

                var backView = false;

                $rootScope.$on('login_event', function () {
                    console.log('category ctrl login event listener');
                    backView = $ionicHistory.backView();
                    console.log('back view');
                    console.log(backView);
                    //if an operation requires login. log pages send back here and restores previous state
                    if ($localStorage.previous && $localStorage.previous.state) {
                        var state = $localStorage.previous.state;
                        console.log('previous state');
                        console.log(state);
                        var category = $localStorage.previous.state.category;
                        $scope.current_category = category;

                        $localStorage.previous = {};
                        backView = false;
                        if (state.function == 'wishlist') {
                            $scope.wishlist(state.param);
                        }
                    }
                });
                if ($stateParams.father_key) {
                    console.log('setting category via search params');
                    $scope.current_category = {
                        father_key: $stateParams.father_key,
                        search: $stateParams.search,
                    };
                } else if ($stateParams.cat_id && $stateParams.sub_cat_id) {
                    console.log('setting category via state params');
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
                    if (!$scope.showProducts) {
                        $scope.showProductsFn();
                    } else {
                        $scope.showProducts = false;
                        $scope.showSortBy = true;
                        $scope.showFilter = false;
                    }
                    $ionicScrollDelegate.scrollTop();
                }
                $scope.showFiltersFn = function () {
                    if (!$scope.showProducts) {
                        $scope.showProductsFn();
                    } else {
                        $scope.showProducts = false;
                        $scope.showSortBy = false;
                        $scope.showFilter = true;
                    }
                    $ionicScrollDelegate.scrollTop();
                }
                $scope.open = function (obj) {
                    if (!obj.open) {
                        obj.open = true;
                    } else {
                        obj.open = !obj.open;
                    }
                }
                $scope.hideFilterBox = true;
                $scope.scroll_direction = {
                    direction: 1
                }
                $scope.$watch('scroll_direction.direction', function (value) {
                    console.log('scroll direct change');
                    if (value && value == -1) {
                        $scope.hideFilterBox = true;
                    } else {
                        $scope.hideFilterBox = false;
                    }
                })

                $scope.refershCategory = function () {
                    var cat = {
                        name: $scope.currentState.name,
                        cat_id: $scope.currentState.cat_id,
                        sub_cat_id: $scope.currentState.sub_cat_id
                    };
                    $scope.current_category = cat;
                    $scope.$apply();
                }

                $scope.removeFilter = function (filter) {
                    var url = filter.param;
                    $scope.product_loading = true;
                    var state = $scope.currentState;
                    var filters = state.filters;
                    var new_filters = [];

                    for (var i = 0; i < filters.length; i++) {
                        if (filters[i].param != url) {
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
                        $scope.update(ret);
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
                        $scope.update(ret);
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
                        $scope.update(ret);
                        $scope.showProductsFn();
                    });
                }
                
                $scope.$on('search_event',function(){
                    var text = $rootScope.search.text;
                    alert(text);
                })

                $scope.$watch('current_category', function (cat) {
                    console.log(cat);
                    if (cat) {
                        console.log('processing');
                        $scope.currentState = {};
                        $scope.currentState = cat;
                        if (!cat.cat_id) {
                            cat.cat_id = -1;
                            cat.sub_cat_id = -1;
                        }
                        if (!cat.father_key) {
                            cat.father_key = '';
                        }
                        if (!cat.search) {
                            cat.search = '';
                        }
                        $scope.currentState.filters = [];
//                        $ionicNavBarDelegate.title(cat.name);
                        var products = [];
                        $scope.products = products;
                        $scope.product_loading = true;
                        var req = categoryHelper.fetchProduct(cat);

                        req.then(function (ret) {
                            $scope.product_loading = false;
                            $scope.update(ret);
                            $scope.$broadcast('scroll.refreshComplete');
                        });
                        req.then(function () {
                            $scope.$broadcast('scroll.refreshComplete');
                        });
                    }
                });
                $scope.nextPage = function (force) {
                    console.log('next page');
                    if ($scope.currentState.page && ($scope.currentState.page * 1 != -1 && $scope.currentState.page * 1 <= 10) || force) {
                        $scope.product_loading = true;
                        var state = $scope.currentState;
                        state.page++;
                        var req = categoryHelper.fetchProduct(state);
                        req.then(function (ret) {
                            $scope.product_loading = false;
                            $scope.update(ret, true);
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        });
                    } else {
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                }

                $scope.page_size = 1;
                $scope.page_range = 2;
                $scope.current_start_page = 1;

                $scope.update = function (ret, append) {
                    $scope.currentState.page = ret.page;
                    console.log(ret.products.length + 'products');
                    console.log('current page ' + ret.page)
                    $scope.page_size = ret.products.length;
                    if ($scope.products && append) {
                        var products = $scope.products;
//                        if (ret.page > $scope.page_range) {
//                            for (var i = 0; i < ret.products.length; i++) {
//                                products.shift();
//                            }
//                            $scope.current_start_page = ret.page - $scope.page_range;
//                        }
//
                        for (var i = 0; i < ret.products.length; i++) {
                            products.push(ret.products[i]);
                        }
                        $scope.products = products;
                    } else {
                        $scope.products = ret.products;
                        $scope.current_start_page = 1;
                    }
                    $scope.next_page_url = ret.page;
                    $scope.sortBy = ret.sortBy;
                    $scope.filters = ret.filters;

                }
                $scope.wishlist = function (product) {
                    product.wishlist = 2;
                    var ajax = wishlistHelper.add(product._id);
                    ajax.then(function () {
                        product.wishlist = 1;
                        toast.showShortBottom(product.name + " added to your wishlist!!");
                    }, function (data) {
                        if (data.login == 1) {
                            if (!$localStorage.previous) {
                                $localStorage.previous = {};
                            }
                            $localStorage.previous.state = {
                                function: 'wishlist',
                                param: angular.copy(product),
                                category: angular.copy($scope.currentState)
                            };
                        }
                        product.wishlist = false;
                    });
                }
                $scope.openProduct = function (product) {
                    var id = product._id;
                    console.log('open product ');
                    $location.path('/app/product/' + id);
                    dataShare.broadcastData(angular.copy(product), 'product_open');
                }

            }
        ]);