var categoryMod = angular.module('CategoryMod', ['CategoryService', 'WishlistService', 'ionic', 'UrlService']);
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
        ['$scope', 'categoryHelper', 'toast', '$ionicScrollDelegate', '$stateParams', '$localStorage', '$rootScope', 'dataShare', '$timeout', 'timeStorage', '$ionicModal', 'pinchServie', 'urlHelper', 'accountHelper',
            function ($scope, categoryHelper, toast, $ionicScrollDelegate, $stateParams, $localStorage, $rootScope, dataShare, $timeout, timeStorage, $ionicModal, pinchServie, urlHelper, accountHelper) {
                var i = 0;
                $scope.$on('modal.shown', function () {
                    $rootScope.$emit('hide_android_add');
                });
                $scope.$on('modal.hidden', function () {
                    $rootScope.$emit('show_android_add');
                });
                $scope.$on('$ionicView.enter', function () {
                    $ionicScrollDelegate.resize();
                    $ionicScrollDelegate.scrollTop();
                });
                var self = this;
                $scope.isCategoryPage = true;
                $rootScope.$on('login_event', function () {
                    console.log('category ctrl login event listener');
                    //if an operation requires login. log pages send back here and restores previous state
//                    if ($localStorage.previous && $localStorage.previous.state) {
//                        var state = $localStorage.previous.state;
//                        console.log('previous state');
//                        console.log(state);
//                        var category = $localStorage.previous.state.category;
//                        $scope.current_category = category;
//                        $localStorage.previous = {};
//                        if (state.function === 'wishlist') {
//                            $scope.wishlist(state.param);
//                        }
//                    }
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
                    $scope.products = [];
                } else if ($stateParams.father_key) {
                    console.log('setting category via search params');
                    $scope.current_category = {
                        father_key: $stateParams.father_key,
                        search: $stateParams.search
                    };
                    $scope.products = [];
                } else if ($stateParams.cat_id && $stateParams.sub_cat_id) {
                    console.log('setting category via state params');
                    $scope.current_category = {
                        name: $stateParams.name,
                        cat_id: $stateParams.cat_id,
                        sub_cat_id: $stateParams.sub_cat_id
                    };
                    $scope.products = [];
                }



                var products = [];
                $scope.showProducts = true;
                $scope.currentProducts = false;
                $scope.showSortBy = false;
                $scope.showFilter = false;
                $scope.products = products;
                $scope.next_page_url = false;
                $scope.page = 0;
                $scope.currentState = {};
                var backButton = false;

                $ionicModal.fromTemplateUrl('template/partial/category_filter.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.filter_modal = modal;
                });

                $ionicModal.fromTemplateUrl('template/partial/category_sort.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.sort_modal = modal;
                });
                $scope.$on('$destroy', function () {
                    $scope.sort_modal.remove();
                    $scope.filter_modal.remove();
                });
                $scope.showProductsFn = function () {
                    if (backButton) {
                        backButton();
                    }
                    $scope.sort_modal.hide();
                    $scope.filter_modal.hide();
                };
                $scope.showSortByFn = function () {
                    if (!$scope.showProducts) {
                        $scope.showProductsFn();
                    } else {
                        $scope.sort_modal.show();
                    }
                };
                $scope.showFiltersFn = function () {
                    if (!$scope.showProducts) {
                        $scope.showProductsFn();
                    } else {
                        $scope.filter_modal.show();
                    }
                };
                $scope.openFilter = function (obj) {
                    if (!obj.open) {
                        obj.open = true;
                        if (obj.type === 'Brand') {
                            $ionicScrollDelegate.$getByHandle('brand_scroll').resize();
                            if ($scope.brandAlphSkip !== 0) {
                                var skip = $scope.brandAlphSkip * 20 - 10;
                                $ionicScrollDelegate.$getByHandle('brand_scroll').scrollTo(skip, 0, true);
                            }
                        }
                    } else {
                        if (obj.type === 'Brand') {
                            $ionicScrollDelegate.$getByHandle('brand_scroll').scrollTo(0, 0, true);
                        }
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
                    $scope.getLatestFilters(state);
                    var req = categoryHelper.fetchProduct(state);
                    req.then(function (ret) {
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
                $scope.removeSearch = function () {
                    var state = $scope.currentState;
                    state.search = '';
                    $scope.currentState = state;
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


                    var filters = $scope.filters;

                    for (var i = 0; i < filters.length; i++) {
                        var data = filters[i].data;
                        var type = filters[i].type;
                        for (var k = 0; k < data.length; k++) {
                            var filter1 = data[k];
                            var url1 = filter1.param;
                            if (url === url1) {
                                if (multi_support.indexOf(type) === -1) {
                                    filters[i].visible = true;
                                    filters[i].data[k].selected = false;
                                }
                            }

                        }
                    }
                    $scope.filters = filters;



                    $scope.currentState.filters = new_filters;
                    if (state.search.length > 0) {
                        //is search page so fetch filters again
                        $scope.getLatestFilters($scope.currentState, true);
                    }
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
                var multi_support = ['designer_brands', 'premium_brands', 'website', 'size', 'brand', 'color'];
                $scope.filterClick = function (filter_type, filter) {
                    var type = filter_type.type.toLowerCase();
                    if (multi_support.indexOf(type) !== -1) {
                        console.log('multi');
                    } else {
                        console.log('no multi');
                        for (var i = 0; i < filter_type.data.length; i++) {
                            if (filter_type.data[i].param === filter.param) {

                            } else {
                                filter_type.data[i].selected = false;
                            }
                        }
                    }

                };
                $scope.doFilter = function (filter) {
                    var filters = $scope.filters;
                    var selected = false;
                    var state = $scope.currentState;
                    var new_filters = [];
                    var exist_filters = state.filters;
                    for (var i = 0; i < exist_filters.length; i++) {
                        if (exist_filters[i].name === 'Category' || exist_filters[i].name === 'Sub Category') {
                            new_filters.push(exist_filters[i]);
                        }
                    }
                    state.filters = new_filters;
                    //remove this because in search ,each step gets new filter
                    // and it was removing previous filters
                    for (var i = 0; i < filters.length; i++) {
                        var data = filters[i].data;
                        var type = filters[i].key;
                        filters[i].type_select = 0;
                        for (var k = 0; k < data.length; k++) {
                            if (data[k].selected) {
                                var filter = data[k];
                                var url = filter.param;
                                var name = filter.name;
                                $scope.product_loading = true;
                                selected = true;
                                state.filters.push({
                                    name: name,
                                    param: url
                                });
                                filters[i].type_select++;
                                filters[i].open = false; //close all filters during apply
                                if (multi_support.indexOf(type.toLowerCase()) === -1) {
                                    filters[i].visible = false;
                                    console.log('do filter multi support ' + type.toLowerCase());
                                } else {
                                    console.log('do filter multi support non ' + type.toLowerCase());
                                }

                            }
                        }
                    }
                    $scope.filters = filters;
                    if (selected) {
                        state.page = -1;
                        $scope.showProductsFn();
                        $scope.currentState = state;
                        if (state.search.length > 0) {
                            //is search page so fetch filters again
                            $scope.getLatestFilters(state, true);
                        }
                        timeStorage.set('category_' + state.cat_id + "_" + state.sub_cat_id, state, 0.1);
                        $ionicScrollDelegate.scrollTop(true);
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
                        $ionicScrollDelegate.scrollTop(true);
                        timeStorage.set('category_' + state.cat_id + "_" + state.sub_cat_id, state, 0.1);
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

                    if (cat) {

                        console.log('processing');
                        $scope.currentState = {};
                        $scope.currentState = cat;
                        if (!cat.cat_id) {
                            cat.cat_id = -1;
                            cat.sub_cat_id = -1;
                        }

                        var has_prev = false;
                        var prev_state_data = false;
                        if (!cat.search) {
                            prev_state_data = timeStorage.get('category_' + cat.cat_id + "_" + cat.sub_cat_id);
                            if (prev_state_data) {
                                has_prev = true;
                            }
                        }
                        if (has_prev) {
                            $scope.currentState = prev_state_data;
                            cat = prev_state_data;
                            $scope.currentState.title = cat.name;
                        } else {

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
                        }

                        if (cat.search.length === 0) {
                            $scope.getLatestFilters(cat, false);
                        } else {
                            $scope.getLatestFilters(cat, true);
                        }
//                        $ionicNavBarDelegate.title(cat.name);
                        var products = [];
                        $scope.products = products;
                        $scope.product_loading = true;
                        $ionicScrollDelegate.scrollTop(true);
                        var req = categoryHelper.fetchProduct(cat, true);
                        req.then(function (ret) {
                            $scope.product_loading = false;
                            $scope.update(ret);
                            $scope.startPaging = true;
                        });
                    }
                });
                self.brand_filters = {};
                $scope.brand_filters_status = 0;
                $scope.brandAlph = [];
                $scope.brandAlph_width = 0;
                $scope.brandAlphSkip = 0; //skip for animation
                $scope.getLatestFilters = function (cat, is_search) {
                    var req = categoryHelper.fetchFilters(cat, is_search);
                    req.then(function (ret) {

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
                        $scope.sortBy = ret.sortBy;
                        var filters = ret.filters;
                        var prev_state_data = false;
                        if (!cat.search) {
                            prev_state_data = timeStorage.get('category_' + cat.cat_id + "_" + cat.sub_cat_id);
                        }
//                        if (!$scope.filters)
                        $scope.filters = [];
                        var final_filters = $scope.filters;
                        if (prev_state_data && prev_state_data.filters) {
                            var prev_filters = prev_state_data.filters;
                            for (var i = 0; i < filters.length; i++) {
                                var data = filters[i].data;
                                var type = filters[i].key;
//                                        console.log('type ' + type);
                                filters[i].type_select = 0;
                                var new_data = [];
                                for (var k = 0; k < data.length; k++) {
                                    var filter1 = data[k];
                                    var url1 = filter1.param;
                                    var found = false;
                                    for (var j = 0; j < prev_filters.length; j++) {
                                        var url = prev_filters[j].param;
//                                                console.log(url + "XXXXX" + url1 + "yyy");
                                        if (url + "" === url1 + "") {
                                            filters[i].type_select++;
                                            found = true;
//                                            console.log('foundddd');
                                            break;
                                        }
                                    }
                                    if (found) {
                                        filters[i].data[k].selected = true;
//                                        data[k].selected = true;
                                        new_data.unshift(data[k]);
                                        console.log(type + " typeee");
                                        if (multi_support.indexOf(type) === -1) {
                                            console.log('page load non multi support');
                                            filters[i].visible = false;
                                        }
                                    } else {
                                        new_data.push(data[k]);
                                    }

                                }
                                filters[i].data = new_data;
                            }
                        }
                        for (var i = 0; i < filters.length; i++) {
                            if (filters[i].type === 'Brand') {
                                var first_char = false;
                                var alphs = [];
                                var temp_alsph = [];
                                var skip = 0;
                                for (var k = 0; k < filters[i].data.length; k++) {
                                    var name = filters[i].data[k].name;
                                    if (name) {
                                        var char = (name + "").substring(0, 1);
                                        if (/[a-z]/i.test(char) && !first_char) {
                                            first_char = char;
                                        } else {
                                            if (!first_char)
                                                skip++;
                                        }
                                        if (!self.brand_filters[char]) {
                                            self.brand_filters[char] = [];
                                        }
                                        self.brand_filters[char].push(filters[i].data[k]);
                                        if (temp_alsph.indexOf(char) === -1) {
                                            temp_alsph.push(char);
                                        }
                                    }
                                }
                                for (var char in temp_alsph) {
                                    var x = false;
                                    if (temp_alsph[char] === first_char) {
                                        x = true;
                                    }
                                    alphs.push({
                                        name: temp_alsph[char],
                                        selected: x
                                    });
                                }
                                temp_alsph = [];
                                $scope.brandAlphSkip = skip;
                                $scope.brandAlph = alphs;
                                $scope.brandAlph_width = (alphs.length * 20) + "px";
                                var new_data = self.brand_filters[first_char];
//                                for (var k = 0; k < filters[i].data.length; k++) {
//                                    if (k >= 10) {
//                                        break;
//                                    }
//                                    new_data.push(filters[i].data[k]);
//                                }
                                //$scope.brand_filters_status = filters[i].data.length - k;
                                filters[i].data = new_data;
                                final_filters.push(filters[i]);
                            } else {
                                final_filters.push(filters[i]);
                            }
                        }
//                        console.log(final_filters);
                        $scope.filters = final_filters;
                    });
                };
                //when clicking on view more in brand filter

                $scope.openBrandAlph = function (alph) {
                    var filters = $scope.filters;
                    var selected = [];
                    for (var i = 0; i < filters.length; i++) {
                        if (filters[i].type === 'Brand') {
                            var data = filters[i].data;
                            for (var k = 0; k < data.length; k++) {
                                if (data[k].selected) {
                                    selected.push(data[k]);
                                }
                            }
                        }
                    }

                    for (var i = 0; i < filters.length; i++) {
                        if (filters[i].type === 'Brand') {
                            var x = self.brand_filters[alph];
                            filters[i].data = x;
                            for (var k = 0; k < selected.length; k++) {
                                var found = false;
                                for (var l = 0; l < x.length; l++) {
                                    if (x[l].param === selected[k].param) {
                                        found = true;
                                    }
                                }
                                if (!found) {
                                    filters[i].data.unshift(selected[k]);
                                }
                            }
                        }
                    }
                    var x = $scope.brandAlph;
                    for (var k = 0; k < x.length; k++) {
                        if (x[k].name == alph) {
                            x[k].selected = true;
                        } else {
                            x[k].selected = false;
                        }
                    }
                    $scope.brandAlph = x;
                    $scope.filters = filters;
                    $ionicScrollDelegate.resize();
                };
                $scope.openBrand = function () {
                    var filters = $scope.filters;
                    for (var i = 0; i < filters.length; i++) {
                        if (filters[i].type === 'Brand') {
                            var new_data = filters[i].data;
                            var brand_filter_data = self.brand_filters;
                            var x = 0;
                            for (var k = brand_filter_data.length - $scope.brand_filters_status; k < brand_filter_data.length; k++) {
                                x++;
                                if (x > 10) {
                                    break;
                                }
                                new_data.push(brand_filter_data[k]);
                            }
                            $scope.brand_filters_status = brand_filter_data.length - k;
                            filters[i].data = new_data;
                        }
                    }
                    $scope.filters = filters;
                    $ionicScrollDelegate.resize();
                };
                $scope.nextPage = function (force) {
                    console.log('next page');
                    if ($scope.currentState.page && ($scope.currentState.page * 1 !== -1) || force) {
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
                var self = this;
                self.product_ids = [];
                $scope.update = function (ret, append) {

                    if (ret.products.length > 0)
                        $scope.currentProducts = true;
                    else
                        $scope.currentProducts = false;
                    $scope.currentState.page = ret.page;
                    console.log(ret.products.length + 'products');
                    console.log('current page ' + ret.page);
                    $scope.page_size = ret.products.length;
                    if ($scope.products && append) {
                        console.log('appending products');
                        var products = $scope.products;
                        for (i = 0; i < ret.products.length; i++) {
                            if (self.product_ids.indexOf(ret.products[i]._id) === -1) {
                                var image = ret.products[i]._id;
//                                ret.products[i].img = CDN.cdnize(ajaxRequest.url('v1/picture/images/' + image));
                                self.product_ids.push(ret.products[i]._id);
                                products.push(ret.products[i]);
                            }
                        }
                        $scope.products = products;
                    } else {
                        var products = [];
                        self.product_ids = [];
                        for (i = 0; i < ret.products.length; i++) {
                            if (self.product_ids.indexOf(ret.products[i]._id) === -1) {
                                var image = ret.products[i]._id;
//                                ret.products[i].img = CDN.cdnize(ajaxRequest.url('v1/picture/images/' + image));
                                self.product_ids.push(ret.products[i]._id);
                                products.push(ret.products[i]);
                            }
                        }
                        $scope.products = products;
                        console.log('replacing products');
//                        $scope.products = ret.products;
                        $scope.current_start_page = 1;
                    }
                    $scope.next_page_url = ret.page;
                    console.log(ret);
                    if (!$scope.filters) {
                        $scope.filters = [];
                    }
                    if (ret.filters && ret.filters.length > 0 && ret.filters[0].data.length > 0) {
                        var exist_filters = $scope.filters;
                        var has_sec = false;
                        for (var i = 0; i < exist_filters.length; i++) {
                            if (exist_filters[i].type === 'Secondary Colors') {
                                has_sec = true;
                            }
                        }
                        if (!has_sec) {
                            for (i = 0; i < ret.filters.length; i++) {
                                ret.filters[i].type = 'Secondary Colors';
                                exist_filters.unshift(ret.filters[i]);
                            }
                            $scope.filters = exist_filters;
                        }
                    } else {
                        var new_filters = [];
                        var has_sec = false;
                        var exist_filters = $scope.filters;
                        for (var i = 0; i < exist_filters.length; i++) {
                            if (exist_filters[i].type === 'Secondary Colors') {
                                has_sec = true;
                            } else {
                                new_filters.push(exist_filters[i]);
                            }
                        }
                        if (has_sec) {
                            $scope.filters = new_filters;
                        }
                    }
                };
                self.getPinObj = function (active_pin) {
                    for (var i = 0; i < $scope.products.length; i++) {
                        if ($scope.products[i]._id === active_pin) {
                            return $scope.products[i];
                        }
                    }
                    return false;
                };
                $scope.$on('first', function () {
                    var item = self.getPinObj(pinchServie.active_pin);
                    $scope.wishlist(item);
                });
                $scope.$on('third', function () {
                    var item = self.getPinObj(pinchServie.active_pin);
                    $scope.whatsapp(item);
                });
                $scope.$on('fourth', function () {
                    var item = self.getPinObj(pinchServie.active_pin);
                    $scope.facebook(item);
                });

                $scope.wishlist = function (product, $event) {
                    if (window.analytics) {
                        window.analytics.trackEvent('Pin', 'Category Page', urlHelper.getPath());
                    }
                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }
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
                        urlHelper.openSignUp();
                    }
                };
                $scope.openProduct = function (product) {
                    var id = product._id;
                    console.log('open product ' + id);
                    urlHelper.openProductPage(id);
                    product = angular.copy(product);
                    product.cat_name = $scope.current_category.name;
                    dataShare.broadcastData(product, 'product_open');
                };

                $scope.facebook = function (product) {
                    var share_url = 'http://fashioniq.in/m/p/' + product._id;
                    if (window.cordova.platformId === "browser") {
                        if (!accountHelper.isFbInit()) {
                            facebookConnectPlugin.browserInit('765213543516434');
                            accountHelper.fbInit();
                        }
                    }
                    facebookConnectPlugin.showDialog({
                        method: 'share',
                        href: share_url,
                        message: product.name,
                        picture: product.img
                    }, function (data) {
                        console.log(data);
                    }, function (data) {
                        console.log(data);
                        toast.showShortBottom('Unable to Share');
                    });
                };
                $scope.whatsapp = function (product) {
                    console.log('sdsadfasdf');
                    var share_url = 'http://fashioniq.in/m/p/' + product._id;
                    window.plugins.socialsharing.shareViaWhatsApp(
                            product.name, product.img, share_url, function () {
                            }, function () {
                        toast.showShortBottom('Unable to Share');
                    });
                };
            }
        ]);