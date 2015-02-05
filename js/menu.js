var menuMod = angular.module('MenuMod', ['ServiceMod', 'ngStorage', 'ionic']);

menuMod.controller('MenuCtrl',
        ['$scope', 'ajaxRequest', '$localStorage', '$location', '$ionicNavBarDelegate', '$rootScope', 'timeStorage', 'toast', '$ionicModal', 'wishlistHelper', 'dataShare', '$ionicLoading', 'accountHelper',
            function ($scope, ajaxRequest, $localStorage, $location, $ionicNavBarDelegate, $rootScope, timeStorage, toast, $ionicModal, wishlistHelper, dataShare, $ionicLoading, accountHelper) {
//                $ionicNavBarDelegate.showBackButton(false);

                $scope.$on('$ionicExposeAside', function () {
                    $rootScope.$emit('custom_ionicExposeAside');
                });
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
                    $scope.user_details = $localStorage.user;
                }

                $scope.logout = function () {
                    $scope.login = false;
                    var ajax = accountHelper.logout();
                    $ionicLoading.show({
                        template: 'Logging Out..'
                    });
                    ajax.finally(function () {
                        var email = '';
                        if ($localStorage.user && $localStorage.user.email) {
                            email = $localStorage.user.email;
                        }
                        $localStorage.user = {
                            email: email
                        };
                        $rootScope.$broadcast('logout_event');
                        $ionicLoading.hide();
                    });
                };

                $scope.$on('login_event', function () {
                    $ionicNavBarDelegate.showBackButton(false);
                    $scope.login = true;
                });
                $scope.$on('logout_event', function () {
                    $scope.login = false;
                });

                $scope.selectCategory = function (cat) {
                    console.log('select category');
                    if (cat.sub_cat_id === 1 || cat.cat_id === -1) {
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
                };
                $scope.profile = function (user_id) {
                    $location.path('/app/profile/' + user_id + '/mine');
                };
                $scope.wishlist = function () {
                    $location.path('/app/profile/me/mine');
                };
                $scope.account = function () {
                    $location.path('/app/profile/me/profile');
                };
                $scope.feedback = function () {
                    $location.path('/app/feedback');
                };
                $scope.aboutus = function () {
                    $location.path('/app/aboutus');
                };
                $scope.invite = function () {
                    $location.path('/app/invite');
                };
                $scope.home = function () {
                    $location.path('/app/home');
                };

                $rootScope.showSearchBox = false;
                $rootScope.search = {
                    text: ''
                };
                $scope.searchNow = function () {
                    $rootScope.showSearchBox = true;
                };
                $scope.$on('$destroy', function () {
                    $scope.modal.remove();
                });
                $scope.closeModel = function () {
                    $scope.modal.hide();
                };
                $ionicModal.fromTemplateUrl('template/partial/search-category.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal;
                });
                $scope.doSearch = function () {
                    if ($rootScope.search.text.length > 0) {

                        var path = $location.path();
                        if (path.indexOf('/app/category') !== -1) {
                            $scope.$broadcast('search_event');
                        } else if (path.indexOf('/app/product') !== -1) {
                            $scope.$broadcast('search_product_event');
                        } else {
                            $scope.modal.show();
                        }

                    } else {
                        toast.showShortBottom('Enter Search Term');
                    }
                };
                $scope.search_cat = false;
                $scope.selectSearchCategory = function (cat) {
                    console.log(cat);
                    $scope.search_cat = cat;
                    $scope.modal.hide();
                    var father_key = cat.father_key;
                    $location.path('/app/search/' + father_key + "/" + $rootScope.search.text);
                    $rootScope.search.text = '';
                    $rootScope.showSearchBox = false;
                };


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
                };
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
                };
                $scope.refreshList = function () {
                    var ajax = wishlistHelper.list(true);
                    ajax.then(function (data) {
                        $scope.lists = data;
                        $scope.$broadcast('scroll.refreshComplete');
                    }, function () {
                        $scope.$broadcast('scroll.refreshComplete');
                    });
                };
                $scope.tickList = function (list) {
                    var lists = $scope.lists.me;
                    wishlistHelper.incListPriority(list._id);
                    for (var i = 0; i < lists.length; i++) {
                        if (lists[i]._id === list._id) {
                            lists[i].tick = true;
                        } else {
                            lists[i].tick = false;
                        }
                    }
                    $scope.lists.me = lists;
//                    list.tick = true;
                };
                $scope.selectList = function () {

                    var list = false;
                    var lists = $scope.lists.me;
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
                                toast.showShortBottom('Added To Your Wishlist');
                            }, function (message) {
                                $scope.wishlist_product.product.wishlist_status = 3;
                            });
                        } else if ($scope.wishlist_product.item) {
                            $scope.wishlist_product.item.select_list_id = list._id;
                            $scope.$broadcast('wishlist_pin_select');
                        } else {
                            $location.path('/app/wishlist_item_add/' + list._id + "/step1");
                        }
                    }
                };
                $scope.showWishlist = function () {
                    var ajax = wishlistHelper.list();
                    ajax.then(function (data) {
                        $scope.lists = data;
                    });
                    $scope.wishlistmodal.show();
                };
                $scope.addWishlistItem = function () {
                    if ($localStorage.user && $localStorage.user.id) {
                        if ($rootScope.list_id) {
                            dataShare.broadcastData({}, 'add_wishlist_item');
                            $location.path('/app/wishlist_item_add/' + $rootScope.list_id + "/step1");
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
                        $location.path('/app/signup');
                    }
                };
            }
        ]);