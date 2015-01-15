var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic']);

homeMod.controller('HomeCtrl',
        ['$scope', 'ajaxRequest', '$localStorage', '$location', '$ionicNavBarDelegate', '$rootScope', 'timeStorage', 'toast', '$ionicModal', 'wishlistHelper', 'dataShare',
            function ($scope, ajaxRequest, $localStorage, $location, $ionicNavBarDelegate, $rootScope, timeStorage, toast, $ionicModal, wishlistHelper, dataShare) {
                $ionicNavBarDelegate.showBackButton(false);
                if (timeStorage.get('category')) {
                    console.log('category from cache');
                    $scope.category = timeStorage.get('category');
                } else {
                    console.log('category not from cache');
                    $scope.category = [];
                    var ajax = ajaxRequest.send('v1/catalog/list', {});
                    ajax.then(function (data) {
                        $scope.category = data;
                        timeStorage.set('category', data, 24);
                    });
                }

                $scope.login = false;
                if ($localStorage.user && $localStorage.user.id) {
                    $scope.login = true;
                }

                $scope.logout = function () {
                    $scope.login = false;
                    var email = '';
                    if ($localStorage.user && $localStorage.user.email) {
                        email = $localStorage.user.email;
                    }
                    $localStorage.user = {
                        email: email
                    };
                    $rootScope.$broadcast('logout_event');
                }

                $scope.$on('login_event', function () {
                    $ionicNavBarDelegate.showBackButton(false);
                    $scope.login = true;
                })
                $scope.$on('logout_event', function () {
                    $scope.login = false;
                })

                $scope.selectCategory = function (cat) {
                    console.log('select category');
                    if (cat.sub_cat_id == 1 || cat.cat_id == -1) {
                        if (cat.open) {
                            cat.open = !cat.open;
                        } else {
                            cat.open = true;
                        }

                        return;
                    }
                    $location.path('/app/category/' + cat.cat_id + '/' + cat.sub_cat_id + '/' + cat.name);
                    //$location.path('/#/app/home');
                    //$scope.current_category = cat;
                }
                $scope.wishlist = function () {
                    $location.path('/app/wishlist');
                }
                $scope.account = function () {
                    $location.path('/app/account');
                }
                $scope.feedback = function () {
                    $location.path('/app/feedback');
                }
                $scope.aboutus = function () {

                }
                $scope.invite = function () {
                    $location.path('/app/invite');
                }

                $rootScope.showSearchBox = false;
                $rootScope.search = {
                    text: ''
                }
                $scope.searchNow = function () {
                    $rootScope.showSearchBox = true;
                }
                $scope.$on('$destroy', function () {
                    $scope.modal.remove();
                });
                $scope.closeModel = function () {
                    $scope.modal.hide();
                }
                $ionicModal.fromTemplateUrl('template/partial/search-category.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal;
                });
                $scope.doSearch = function () {
                    if ($rootScope.search.text.length > 0) {

                        var path = $location.path();
                        if (path.indexOf('/app/category') != -1) {
                            $scope.$broadcast('search_event');
                        } else if (path.indexOf('/app/product') != -1) {
                            $scope.$broadcast('search_product_event');
                        } else {
                            $scope.modal.show();
                        }

                    } else {
                        toast.showShortBottom('Enter Search Term');
                    }
                }
                $scope.search_cat = false;
                $scope.selectSearchCategory = function (cat) {
                    console.log(cat);
                    $scope.search_cat = cat;
                    $scope.modal.hide();
                    var father_key = cat.father_key;
                    $location.path('/app/search/' + father_key + "/" + $rootScope.search.text);
                    $rootScope.search.text = '';
                    $rootScope.showSearchBox = false;
                }


                //wishlist code below
                $scope.wishlist_product = {
                    product: false,
                    item: false,
                    new_item: false
                };
                $scope.$on('$destroy', function () {
                    $scope.wishlistmodal.remove();
                });
                $scope.closeWishlistModel = function () {
                    $scope.wishlistmodal.hide();
                }
                $ionicModal.fromTemplateUrl('template/partial/wishlist-select.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.wishlistmodal = modal;
                });

                $scope.newList = function () {
                    if ($scope.wishlist_product.product) {
                        dataShare.broadcastData({
                            product: angular.copy($scope.wishlist_product.product)
                        }, 'wishstlist_new');
                    } else if ($scope.wishlist_product.item) {
                        dataShare.broadcastData({
                            item: angular.copy($scope.wishlist_product.product)
                        }, 'wishstlist_new');
                    } else if ($scope.wishlist_product.new_item) {
                        dataShare.broadcastData({
                            new_item: true
                        }, 'wishstlist_new');
                    }
                    $scope.closeWishlistModel();
                    $location.path('/app/wishlist_add');
                }
                $scope.refreshList = function () {
                    var ajax = wishlistHelper.list(true);
                    ajax.then(function (data) {
                        $scope.lists = data;
                        $scope.$broadcast('scroll.refreshComplete');
                    }, function () {
                        $scope.$broadcast('scroll.refreshComplete');
                    });
                }
                $scope.tickList = function (list) {
                    var lists = $scope.lists;
                    for (var i = 0; i < lists.length; i++) {
                        lists[i].tick = false;
                    }
                    list.tick = true;
                    $scope.lists = lists;
                }
                $scope.selectList = function () {

                    var list = false;
                    var lists = $scope.lists;
                    for (var i = 0; i < lists.length; i++) {
                        if (lists[i].tick) {
                            list = lists[i];
                            break;
                        }
                    }
                    if (!list) {
                        toast.showShortBottom('No List Selected');
                    } else {
                        $scope.closeWishlistModel();
                        if ($scope.wishlist_product.product) {
                            $scope.wishlist_product.product.wishlist_status = 1;
                            var ajax2 = wishlistHelper.add($scope.wishlist_product.product._id, list._id);
                            ajax2.then(function () {
                                $scope.wishlist_product.product.wishlist_status = 2;
                            }, function (message) {
                                $scope.wishlist_product.product.wishlist_status = 3;
                            });
                        } else if ($scope.wishlist_product.item) {
                            $scope.wishlist_product.item['select_list_id'] = list._id;
                            $scope.$broadcast('wishlist_pin_select');
                        } else {
                            $location.path('/app/wishlist_item_add/' + list._id);
                        }
                    }
                }
                $scope.showWishlist = function () {
                    var ajax = wishlistHelper.list();
                    ajax.then(function (data) {
                        $scope.lists = data;
                    });
                    $scope.wishlistmodal.show();
                }
                $scope.addWishlistItem = function () {
                    if ($localStorage.user && $localStorage.user.id) {
                        if ($rootScope.list_id) {
                            dataShare.broadcastData({}, 'add_wishlist_item');
                            $location.path('/app/wishlist_item_add/' + $rootScope.list_id);
                        } else {
                            $scope.wishlist_product.product = false;
                            $scope.wishlist_product.item = false;
                            $scope.wishlist_product.new_item = true;
                            var ajax = wishlistHelper.list();
                            ajax.then(function (data) {
                                $scope.lists = data;
                            });
                            $scope.wishlistmodal.show();
                        }
                    } else {
                        toast.showShortBottom('Login To Add Item To Your Wishlist');
                    }
                }
            }
        ]);