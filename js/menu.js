var menuMod = angular.module('MenuMod', ['ServiceMod', 'ngStorage', 'ionic', 'pasvaz.bindonce']);

menuMod.controller('MenuCtrl',
        ['$scope', 'ajaxRequest', '$localStorage', '$location', '$ionicNavBarDelegate', '$rootScope', 'timeStorage', 'toast', '$ionicModal', 'wishlistHelper', 'dataShare', '$ionicLoading', 'accountHelper', 'notifyHelper', '$ionicSideMenuDelegate', '$cordovaNetwork', '$ionicPlatform', '$ionicScrollDelegate',
            function ($scope, ajaxRequest, $localStorage, $location, $ionicNavBarDelegate, $rootScope, timeStorage, toast, $ionicModal, wishlistHelper, dataShare, $ionicLoading, accountHelper, notifyHelper, $ionicSideMenuDelegate, $cordovaNetwork, $ionicPlatform, $ionicScrollDelegate) {
//                $ionicNavBarDelegate.showBackButton(false);

                if ($localStorage.user.id) {
                    notifyHelper.checkForUpdates();
                }
                $scope.checkOffline = function () {
                    if ($cordovaNetwork.isOnline()) {
                        $location.app('/app/home/trending');
                    } else {
                        toast.showShortBottom('Still Offline...');
                    }
                };
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
                $ionicModal.fromTemplateUrl('template/partial/user-follow.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.friend_list_model = modal;
                });
                $rootScope.$on('facebook_friends_found', function () {
                    //called from inviteHelper on login/register
                    console.log('facebook friends broadcast');
                    var friends = dataShare.getData();
                    if (friends.length > 0) {
                        $scope.users = friends;
                        $scope.friend_list_model.show();
                        $scope.user_follow_title = 'New Facebook Friends Added';
                    }

                });

                $scope.login = false;
                if ($localStorage.user && $localStorage.user.id) {
                    $scope.login = true;
                    $scope.user_details = $localStorage.user;
                }

                $scope.logout = function () {
                    $scope.login = false;
                    if (window.analytics) {
                        window.analytics.trackEvent('Menu', 'Logout');
                    }
                    var ajax = accountHelper.logout();
                    $ionicLoading.show({
                        template: 'Logging Out..'
                    });
                    $ionicSideMenuDelegate.toggleLeft(false);
                    ajax.finally(function () {
                        $ionicLoading.hide();
                        var email = '';
                        if ($localStorage.user && $localStorage.user.email) {
                            email = $localStorage.user.email;
                        }
                        $localStorage.user = {
                            email: email
                        };
                        $rootScope.$broadcast('logout_event');
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
                    console.log(cat);
                    if (cat.sub_cat_id === 1 || cat.cat_id === -1) {
                        if (cat.open) {
                            cat.open = !cat.open;
                        } else {
                            cat.open = true;
                        }
                        $ionicScrollDelegate.resize();
                        return;
                    }
                    $ionicScrollDelegate.resize();
                    $ionicScrollDelegate.$getByHandle('left_menu').scrollTop();
                    $ionicSideMenuDelegate.toggleLeft(false);
                    $location.path('/app/category/' + cat.cat_id + '/' + cat.sub_cat_id + '/' + cat.name);

                    var category = $scope.category;
                    for (var i = 0; i < category.length; i++) {
                        var cat = category[i];
                        cat.open = false;
                        if (cat.data) {
                            for (var j = 0; j < cat.data.length; j++) {
                                var catSub = cat.data[j];
                                catSub.open = false;
                                if (catSub.data) {
                                    for (var k = 0; k < catSub.data.length; k++) {
                                        var catLast = catSub.data[k];
                                        catLast.open = false;
                                    }
                                }
                            }
                        }
                    }
                    $scope.category = category;
                    //$location.path('/#/app/home');
                    //$scope.current_category = cat;
                };
                $scope.profile = function (user_id) {
                    $location.path('/app/profile/' + user_id + '/mine');
                    if (window.analytics) {
                        window.analytics.trackEvent('Menu', 'Profile');
                    }
                };
                $scope.signup = function () {
                    $location.path('/app/signup');
                    if (window.analytics) {
                        window.analytics.trackEvent('Menu', 'SignUp');
                    }
                };
                $scope.wishlist = function () {
                    if ($rootScope.profile_update > 0) {
                        if (window.analytics) {
                            window.analytics.trackEvent('Profile', 'Updates');
                        }
                        if ($localStorage.user.id) {
                            $location.path('/app/profile/' + $localStorage.user.id + '/update');
                        } else {
                            $location.path('/app/profile/me/update');
                        }
                    } else {
                        if (window.analytics) {
                            window.analytics.trackEvent('Profile', 'Top');
                        }
                        if ($localStorage.user.id) {
                            $location.path('/app/profile/' + $localStorage.user.id + '/mine');
                        } else {
                            $location.path('/app/profile/me/mine');
                        }
                    }
                };
                $scope.account = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('Profile', 'Left Menu');
                        window.analytics.trackEvent('Menu', 'Profile');
                    }
                    $location.path('/app/profile/me/profile');
                };
                $scope.feedback = function () {
                    $location.path('/app/feedback');
                };
                $scope.aboutus = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('Menu', 'About');
                    }
                    $location.path('/app/aboutus');
                };
                $scope.invite = function () {
                    $location.path('/app/invite');
                };
                $scope.home = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('Menu', 'Home');
                    }
                    $location.path('/app/home');
                };

                $rootScope.showSearchBox = false;
                $rootScope.search = {
                    text: ''
                };
                var searchBack = false;
                $scope.closeSearch = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('Search', 'Search Closed');
                    }
                    $rootScope.showSearchBox = false;
                    if (searchBack)
                        searchBack();
                };
                $scope.searchNow = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('Search', 'Search Top');
                    }
                    $rootScope.showSearchBox = true;
                    searchBack = $ionicPlatform.registerBackButtonAction(function () {
                        $rootScope.showSearchBox = false;
                    }, 99999);
                };
                $scope.$on('$destroy', function () {
                    $scope.modal.remove();
                    $scope.friend_list_model.remove();
                });
                $scope.closeModel = function () {
                    $scope.modal.hide();
                    $scope.friend_list_model.hide();
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

                        if (window.analytics) {
                            window.analytics.trackEvent('Search', 'Search Do');
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

                    var lists = $scope.lists.shared;
                    for (var i = 0; i < lists.length; i++) {
                        if (lists[i]._id === list._id) {
                            lists[i].tick = true;
                        } else {
                            lists[i].tick = false;
                        }
                    }
                    $scope.lists.shared = lists;


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
                        var lists = $scope.lists.shared;
                        for (var i = 0; i < lists.length; i++) {
                            if (lists[i].tick) {
                                list = lists[i];
                                break;
                            }
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
                $scope.clearAjax = function () {
                    $rootScope.ajax_on = false;
                };
            }
        ]);