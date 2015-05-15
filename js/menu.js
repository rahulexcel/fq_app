var menuMod = angular.module('MenuMod', ['ServiceMod', 'ngStorage', 'ionic', 'pasvaz.bindonce', 'UrlService']);

menuMod.controller('MenuCtrl',
        ['$scope', 'ajaxRequest', '$localStorage', '$ionicNavBarDelegate', '$rootScope', 'timeStorage', 'toast', '$ionicModal', 'wishlistHelper', 'dataShare', '$ionicLoading', 'accountHelper', 'notifyHelper', '$ionicSideMenuDelegate', '$cordovaNetwork', '$ionicPlatform', '$ionicScrollDelegate', '$timeout', '$q', 'urlHelper', 'itemHelper',
            function ($scope, ajaxRequest, $localStorage, $ionicNavBarDelegate, $rootScope, timeStorage, toast, $ionicModal, wishlistHelper, dataShare, $ionicLoading, accountHelper, notifyHelper, $ionicSideMenuDelegate, $cordovaNetwork, $ionicPlatform, $ionicScrollDelegate, $timeout, $q, urlHelper, itemHelper) {
                if ($localStorage.user.id) {
                    notifyHelper.checkForUpdates();
                }

                $scope.$on('modal.shown', function () {
                    $rootScope.$emit('hide_android_add');
                });
                $scope.$on('modal.hidden', function () {
                    $rootScope.$emit('show_android_add');
                });
                $scope.checkOffline = function () {
                    if ($cordovaNetwork.isOnline()) {
                        urlHelper.openHomePage();
                    } else {
                        toast.showShortBottom('Still Offline...');
                    }
                };
                var category = timeStorage.get('category');
                if (category && category.length > 0) {
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

                $rootScope.$on('login_event', function () {
//                    $ionicNavBarDelegate.showBackButton(false);
                    $scope.login = true;
                });
                $rootScope.$on('logout_event', function () {
                    $scope.login = false;
                });
                $scope.$watch(function () {
                    return $ionicSideMenuDelegate.isOpen();
                }, function (isOpen) {
                    //this is used to update left menu categories.
                    //sometime left menu doesn't show up
                    //this checks and updates it

                    var category = timeStorage.get('category');
                    if (category && category.length > 0) {
                        console.log('category already loaded');
                    } else {
                        console.log('category not loaded');
                        $scope.category = [];
                        var ajax = ajaxRequest.send('v1/catalog/list', {});
                        ajax.then(function (data) {
                            $scope.category = data;
                            timeStorage.set('category', data, 24);
                        });
                    }
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
                        $ionicScrollDelegate.$getByHandle('left_menu').resize();
                        return;
                    }
                    //$ionicScrollDelegate.resize();
                    $ionicScrollDelegate.$getByHandle('left_menu').scrollTop();
                    $ionicSideMenuDelegate.toggleLeft(false);
                    urlHelper.openCategoryPage(cat.cat_id, cat.sub_cat_id, cat.name);
                    $timeout(function () {
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
                    }, 100);
                };
                $scope.profile = function (user_id) {
                    urlHelper.openProfilePage(user_id, 'mine');
                    if (window.analytics) {
                        window.analytics.trackEvent('Menu', 'Profile');
                    }
                };
                $scope.signup = function () {
                    urlHelper.openSignUp();
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
                            urlHelper.openProfilePage($localStorage.user.id, 'update');
                        } else {
                            urlHelper.openProfilePage('me', 'update');
                        }
                    } else {
                        if (window.analytics) {
                            window.analytics.trackEvent('Profile', 'Top');
                        }
                        if ($localStorage.user.id) {
                            urlHelper.openProfilePage($localStorage.user.id, 'mine');
                        } else {
                            urlHelper.openProfilePage('me', 'mine');
                        }
                    }
                };
                $scope.account = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('Profile', 'Left Menu');
                        window.analytics.trackEvent('Menu', 'Profile');
                    }
                    urlHelper.openProfilePage('me', 'profile');
                };
                $scope.feedback = function () {
                    urlHelper.openFeedbackPage();
                };
                $scope.intro = function () {
                    urlHelper.openIntroPage();
                };
                $scope.aboutus = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('Menu', 'About');
                    }
                    urlHelper.openAboutUsPage();
                };
                $scope.invite = function () {
                    urlHelper.openInvitePage();
                };
                $scope.home = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('Menu', 'Home');
                    }
                    urlHelper.openHomePage();
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

                        var path = urlHelper.getPath();
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
                    urlHelper.openSearchPage(father_key, $rootScope.search.text);
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
                $scope.closeWishlistModel = function (is_from_close_button) {
                    $scope.wishlistmodal.hide();
                    if ($scope.defer && !is_from_close_button) {
                        $scope.defer.reject();
                    }
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
                    urlHelper.openWishlistAddPage();
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
                    wishlistHelper.incListPriority(list._id);
                    var lists = $scope.lists.public;
                    for (var i = 0; i < lists.length; i++) {
                        if (lists[i]._id === list._id) {
                            lists[i].tick = true;
                        } else {
                            lists[i].tick = false;
                        }
                    }
                    $scope.lists.public = lists;

                    var lists = $scope.lists.private;
                    for (var i = 0; i < lists.length; i++) {
                        if (lists[i]._id === list._id) {
                            lists[i].tick = true;
                        } else {
                            lists[i].tick = false;
                        }
                    }
                    $scope.lists.private = lists;

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
                    var lists = $scope.lists.public;
                    for (var i = 0; i < lists.length; i++) {
                        if (lists[i].tick) {
                            list = lists[i];
                            break;
                        }
                    }
                    if (!list) {
                        var lists = $scope.lists.private;
                        for (var i = 0; i < lists.length; i++) {
                            if (lists[i].tick) {
                                list = lists[i];
                                break;
                            }
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
                        $scope.closeWishlistModel(true);
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
                            var list_id = $scope.wishlist_product.item.select_list_id;
                            var ajax = itemHelper.pin($scope.wishlist_product.item._id, list_id);
                            ajax.then(function () {
                                $scope.$broadcast('wishlist_pin_select');
                            }, function () {
                                $scope.$broadcast('wishlist_pin_select');
                            });

                        } else {
                            $scope.defer.resolve(list._id);
//                            $location.path('/app/wishlist_item_add_step2/' + $scope.show_wishlist_type + '/' + list._id);
//                            $location.path('/app/wishlist_item_add/' + list._id + "/step1");
                        }
                    }
                };
                $scope.show_wishlist_type = false;
                $scope.defer = false;

                $scope.showWishlistAsync = function (type, list_id) {
                    if (list_id && list_id * 1 !== -1) {
                        return $q.when(list_id);
                    }
                    $scope.show_wishlist_type = type;
                    $scope.defer = $q.defer();
                    $scope.showWishlist(type);
                    return $scope.defer.promise;
                };
                $scope.showWishlist = function (type) {
                    $scope.show_wishlist_type = false;
                    var ajax = wishlistHelper.list();
                    ajax.then(function (data) {
                        $scope.lists = data;

                        //select a default list if nothing is selected

                        var select = false;
                        var lists = $scope.lists.public;
                        for (var i = 0; i < lists.length; i++) {
                            if (lists[i].tick) {
                                select = true;
                            }
                        }
                        if (!select && lists.length > 0) {
                            lists[0].tick = true;
                            $scope.lists.public = lists;
                        } else {
                            var lists = $scope.lists.private;
                            for (var i = 0; i < lists.length; i++) {
                                if (lists[i].tick) {
                                    select = true;
                                }
                            }
                            if (!select && lists.length > 0) {
                                lists[0].tick = true;
                                $scope.lists.private = lists;
                            } else {
                                var lists = $scope.lists.shared;
                                for (var i = 0; i < lists.length; i++) {
                                    if (lists[i].tick) {
                                        select = true;
                                    }
                                }
                                if (!select && lists.length > 0) {
                                    lists[0].tick = true;
                                    $scope.lists.shared = lists;
                                }
                            }
                        }
                    });

                    $scope.wishlistmodal.show();
                };
                $scope.addWishlistItem = function () {
                    if ($localStorage.user && $localStorage.user.id) {
                        if ($rootScope.list_id) {
                            dataShare.broadcastData($rootScope.list_id, 'add_wishlist_item');
//                            $location.path('/app/wishlist_item_add/' + $rootScope.list_id + "/step1");
                        } else {
//                            $scope.wishlist_product.product = false;
//                            $scope.wishlist_product.item = false;
//                            $scope.wishlist_product.new_item = true;
//                            $scope.showWishlist();
                            dataShare.broadcastData(false, 'add_wishlist_item');
                        }
                        urlHelper.openWishlistAddStep1();
                    } else {
                        toast.showShortBottom('Login To Add Item To Your Wishlist');
                        urlHelper.openSignUp();
                    }
                };
                $scope.clearAjax = function () {
                    $rootScope.ajax_on = false;
                };

//below is code of material add

                $scope.$on('modal.shown', function () {
                    $rootScope.$emit('hide_android_add');
                });
                $scope.$on('modal.hidden', function () {
                    $rootScope.$emit('show_android_add');
                });
                $scope.$on('tap_first', function () {
                    if ($localStorage.user.id) {
                        toast.showShortBottom('Opening Your Camera...');
                        urlHelper.openWishlistAddStep2('camera', -1);
                    } else {
                        toast.showShortBottom('Login/SignUp To Setup Wishlist');
                        urlHelper.openSignUp();
                    }
                });
                $scope.$on('tap_second', function () {
                    if ($localStorage.user.id) {
                        toast.showShortBottom('Opening Your Gallery...');
                        urlHelper.openWishlistAddStep2('gallary', -1);
                    } else {
                        toast.showShortBottom('Login/SignUp To Setup Wishlist');
                        urlHelper.openSignUp();
                    }
                });
                $scope.$on('tap_third', function () {
                    console.log('third')
                    if ($localStorage.user.id) {
                        toast.showShortBottom('Opening...');
                        urlHelper.openWishlistAddStep2('image_url', -1);
                    } else {
                        toast.showShortBottom('Login/SignUp To Setup Wishlist');
                        urlHelper.openSignUp();
                    }
                });
                $scope.$on('tap_fourth', function () {
                    if ($localStorage.user.id) {
                        toast.showShortBottom('Opening...');
                        urlHelper.openWishlistAddStep2('near', -1);
                    } else {
                        toast.showShortBottom('Login/SignUp To Setup Wishlist');
                        urlHelper.openSignUp();
                    }
                });
            }
        ]);