var categoryMod = angular.module('CategoryMod', ['CategoryService', 'WishlistService', 'ionic']);
categoryMod.directive('scrollWatch', ['$window', function ($window) {
        //not working with overflow-scroll=y
        //not working on mahima's system so removed it for now
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var start = scope.$eval(attrs.scrolling) || 0;
                element.bind('scroll', function (e) {
                    if (e.detail.scrollTop >= start) {
                        start = e.detail.scrollTop;
                        if (scope.scroll_direction.direction * 1 !== -1) {
                            scope.scroll_direction.direction = -1;
                            scope.$evalAsync();
                        }
                    } else {
                        if (scope.scroll_direction.direction * 1 !== 1) {
                            scope.scroll_direction.direction = 1;
                            scope.$evalAsync();
                        }
                    }
                });
            }
        };
    }]);
categoryMod.controller('CategoryCtrl',
        ['$scope', 'categoryHelper', '$ionicHistory', 'toast', '$ionicScrollDelegate',
            '$stateParams', '$localStorage', '$rootScope', '$location', 'dataShare', '$timeout',
            function ($scope, categoryHelper, $ionicHistory, toast, $ionicScrollDelegate, $stateParams, $localStorage, $rootScope, $location, dataShare, $timeout) {
                var i = 0;
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
                        if (state.function === 'wishlist') {
                            $scope.wishlist(state.param);
                        }
                    }
                });
                if ($stateParams.search_text) {
                    $scope.current_category = {
                        name: $stateParams.name,
                        cat_id: $stateParams.cat_id,
                        sub_cat_id: $stateParams.sub_cat_id,
                        search: $stateParams.search_text
                    };
                    $rootScope.search.text = '';
                    $rootScope.showSearchBox = false;
                } else if ($stateParams.father_key) {
                    console.log('setting category via search params');
                    $scope.current_category = {
                        father_key: $stateParams.father_key,
                        search: $stateParams.search
                    };
                } else if ($stateParams.cat_id && $stateParams.sub_cat_id) {
                    console.log('setting category via state params');
                    $scope.current_category = {
                        name: $stateParams.name,
                        cat_id: $stateParams.cat_id,
                        sub_cat_id: $stateParams.sub_cat_id
                    };
                }



                var products = [];
                $scope.showProducts = true;
                $scope.currentProducts = [];
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
                };
                $scope.showSortByFn = function () {
                    if (!$scope.showProducts) {
                        $scope.showProductsFn();
                    } else {
                        $scope.showProducts = false;
                        $scope.showSortBy = true;
                        $scope.showFilter = false;
                        $ionicScrollDelegate.scrollTop();
                    }
                };
                $scope.showFiltersFn = function () {
                    if (!$scope.showProducts) {
                        $scope.showProductsFn();
                    } else {
                        $scope.showProducts = false;
                        $scope.showSortBy = false;
                        $scope.showFilter = true;

                        $ionicScrollDelegate.scrollTop();
                    }
                };
                $scope.open = function (obj) {
                    if (!obj.open) {
                        obj.open = true;
                    } else {
                        obj.open = !obj.open;
                    }
                };
                $scope.hideFilterBox = true;
                $scope.scroll_direction = {
                    direction: 1
                };
                $scope.$watch('scroll_direction.direction', function (value) {
                    console.log('scroll direct change');
                    if (value && value === -1) {
                        $scope.hideFilterBox = true;
                    } else {
                        $scope.hideFilterBox = false;
                    }
                });
                $scope.refreshCategory = function () {
                    var state = $scope.currentState;
                    state.page = -1;
                    $scope.currentState = state;
                    var req = categoryHelper.fetchProduct(state);
                    req.then(function (ret) {
                        $scope.currentProducts = ret.products;
                        if (ret.products.length === 0) {
                            toast.showShortBottom('Product Not Found Matching Current Filter');
                        }
                        $scope.update(ret);
                        $scope.showProductsFn();
                        $timeout(function () {
                            $scope.$broadcast('scroll.refreshComplete');
                        }, 39);
                    }, function () {
                        $scope.$broadcast('scroll.refreshComplete');
                    });
                };
                $scope.removeFilter = function (filter) {
                    var url = filter.param;
                    $scope.product_loading = true;
                    var state = $scope.currentState;
                    var filters = state.filters;
                    var new_filters = [];
                    for (var i = 0; i < filters.length; i++) {
                        if (filters[i].param !== url) {
                            new_filters.push(filters[i]);
                        }
                    }
                    $scope.currentState.filters = new_filters;
                    var req = categoryHelper.fetchProduct(state);
                    req.then(function (ret) {
                        $scope.product_loading = false;
                        if (ret.products.length === 0) {
                            toast.showShortBottom('Product Not Found Matching Current Filter');
                        }
                        $scope.update(ret);
                        $scope.showProductsFn();
                    });
                };
                $scope.filterClick = function (filter_type, filter) {
//                    console.log(filter);
//                    console.log(filter_type);

                    var type = filter_type.type.toLowerCase();
                    var multi_support = ['brand', 'website', 'color', 'size'];
                    if (multi_support.indexOf(type) !== -1) {
                        console.log('multi');
                    } else {
                        console.log('no multi');
                        for (var i = 0; i < filter_type.data.length; i++) {
                            console.log(filter_type.data[i].param + "XXXX" + filter.param);
                            if (filter_type.data[i].param === filter.param) {

                            } else {
                                filter_type.data[i].selected = false;
                            }
                        }
                    }

                };
                $scope.doFilter = function (filter) {
//                    if (!filter.param) {
//                        var cat_id = filter.cat_id;
//                        var sub_cat_id = filter.sub_cat_id;
//                        var cat_name = filter.cat_name;
//                        var search = $scope.currentState.search;
//                        $location.path('/app/category/' + cat_id + '/' + sub_cat_id + '/' + cat_name + '/' + search);
//                    } else {

                    var filters = $scope.filters;

                    var selected = false;
                    var state = $scope.currentState;
                    for (var i = 0; i < filters.length; i++) {
                        var data = filters[i].data;
                        for (var k = 0; k < data.length; k++) {
                            if (data[k].selected) {
                                var filter = data[k];
                                var url = filter.param;
                                var name = filter.name;
                                $scope.product_loading = true;
                                selected = true;
                                if (!state.filters) {
                                    state.filters = [];
                                }
                                state.filters.push({
                                    name: name,
                                    param: url
                                });
                            }
                        }
                    }
                    if (selected) {
                        state.page = -1;
                        $scope.showProductsFn();
                        $scope.currentState = state;
                        var req = categoryHelper.fetchProduct(state);
                        req.then(function (ret) {
                            $scope.product_loading = false;
                            if (ret.products.length === 0) {
                                toast.showShortBottom('Product Not Found Matching Current Filter');
                            }
                            $scope.update(ret);
                        });
                    } else {
                        toast.showShortBottom('No Filter Selected');
                    }
//                    }
                };
                $scope.sortClick = function (sort) {
                    var sortBy = $scope.sortBy;
                    for (var i = 0; i < sortBy.length; i++) {
                        if (sortBy[i].url === sort.url) {

                        } else {
                            sortBy[i].selected = false;
                        }
                    }
                    $scope.sortBy = sortBy;
                };
                $scope.doApply = function () {
                    if ($scope.showSortBy) {
                        $scope.doSort();
                    } else {
                        $scope.doFilter();
                    }
                };
                $scope.doSort = function () {
                    var sort = false;
                    var sortBy = $scope.sortBy;
                    for (var i = 0; i < sortBy.length; i++) {
                        if (sortBy[i].selected) {
                            sort = sortBy[i];
                        }
                    }
                    if (sort) {
                        $scope.showProductsFn();
                        var url = sort.url;
                        $scope.product_loading = true;
                        var state = $scope.currentState;
                        state.page = -1;
                        $scope.currentState = state;
                        state.sortby = url;
                        var req = categoryHelper.fetchProduct(state);
                        req.then(function (ret) {
                            $scope.product_loading = false;
                            $scope.update(ret);
                        });
                    } else {
                        toast.showShortBottom('Nothing To Do...');
                    }
                };
                $scope.$on('search_event', function () {
                    $scope.showProductsFn();
                    var text = $rootScope.search.text;
                    $scope.product_loading = true;
                    $scope.currentState.search = text;
                    var state = $scope.currentState;
                    var req = categoryHelper.fetchProduct(state);
                    req.then(function (ret) {
                        $rootScope.search.text = '';
                        $rootScope.showSearchBox = false;
                        $scope.product_loading = false;
                        $scope.update(ret);
                    });
                });
                $scope.startPaging = false;
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
                        if (cat.search.length > 0) {
                            $scope.currentState.title = cat.search;
                        } else {
                            $scope.currentState.title = cat.name;
                        }
                        $scope.currentState.filters = [];
//                        $ionicNavBarDelegate.title(cat.name);
                        var products = [];
                        $scope.products = products;
                        $scope.product_loading = true;
                        var req = categoryHelper.fetchProduct(cat, true);
                        req.then(function (ret) {
                            $scope.product_loading = false;
                            $scope.update(ret);
                            $scope.startPaging = true;
                        });
                    }
                });
                $scope.nextPage = function (force) {
                    console.log('next page');
                    if ($scope.currentState.page && ($scope.currentState.page * 1 !== -1 && $scope.currentState.page * 1 <= 10) || force) {
                        var state = $scope.currentState;
                        state.page++;
                        var req = categoryHelper.fetchProduct(state);
                        req.then(function (ret) {
                            $scope.product_loading = false;
                            $scope.update(ret, true);
                            $timeout(function () {
                                $scope.$broadcast('scroll.infiniteScrollComplete');
                            }, 30);
                        });
                    } else {
                        console.log('here');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                };
                $scope.page_size = 1;
                $scope.page_range = 2;
                $scope.current_start_page = 1;
                $scope.update = function (ret, append) {

                    $scope.currentProducts = ret.products;
                    $scope.currentState.page = ret.page;
                    console.log(ret.products.length + 'products');
                    console.log('current page ' + ret.page);
                    $scope.page_size = ret.products.length;
                    if ($scope.products && append) {
                        console.log('appending products');
                        var products = $scope.products;
//                        if (ret.page > $scope.page_range) {
//                            for (var i = 0; i < ret.products.length; i++) {
//                                products.shift();
//                            }
//                            $scope.current_start_page = ret.page - $scope.page_range;
//                        }
//
                        for (i = 0; i < ret.products.length; i++) {
                            products.push(ret.products[i]);
                        }
                        $scope.products = products;
                    } else {
                        console.log('replacing products');
                        $scope.products = ret.products;
                        $scope.current_start_page = 1;
                    }
                    $scope.next_page_url = ret.page;
                    if (!$scope.currentState.sortby || $scope.currentState.sortby.length === 0) {
                        $scope.currentState.sortby = 'popular';
                    }
                    if ($scope.currentState.sortby && ret.sortBy && ret.sortBy.length > 0) {
                        for (i = 0; i < ret.sortBy.length; i++) {
                            if (ret.sortBy[i].url === $scope.currentState.sortby) {
                                ret.sortBy[i].selected = true;
                            } else {
                                ret.sortBy[i].selected = false;
                            }
                        }
                    }
                    if ($scope.currentState.filters && ret.filters && ret.filters.length > 0) {
                        for (i = 0; i < ret.filters.length; i++) {
                            var data = ret.filters[i].data;
                            for (var k = 0; k < $scope.currentState.filters.length; k++) {
                                for (var j = 0; j < data.length; j++) {
                                    if ($scope.currentState.filters[k].param === data[j].param) {
                                        ret.filters[i].open = true;
                                        ret.filters[i].data[j].selected = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    $scope.sortBy = ret.sortBy;
                    $scope.filters = ret.filters;
                    console.log($scope.currentState);
                };
                $scope.wishlist = function (product, $event) {
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
                        $localStorage.previous.state = {
                            function: 'wishlist',
                            param: angular.copy(product),
                            category: angular.copy($scope.currentState)
                        };
                        $location.path('/app/signup');
                    }
                };
                $scope.openProduct = function (product) {
                    var id = product._id;
                    console.log('open product ');
                    $location.path('/app/product/' + id);
                    product = angular.copy(product);
                    product.cat_name = $scope.current_category.name;
                    dataShare.broadcastData(product, 'product_open');
                };
            }
        ]);