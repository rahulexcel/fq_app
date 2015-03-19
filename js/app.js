// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// netstat -tulpn

var app = angular.module('starter',
        [
            'ionic',
            'CategoryMod',
            'HomeMod',
            'MenuMod',
            'ProductMod',
            'RegisterMod',
            'AccountMod',
            'FeedbackMod',
            'ProfileMod',
            'InviteMod',
            'WishlistNewMod',
            'WishlistItemMod',
            'WishlistItemAddMod',
            'WishlistItemsMod',
            'NotifyMod',
            'PinMod',
            'ngCordova',
            'pasvaz.bindonce',
            'HomeCatMod'
        ]
        );
app.config(["$stateProvider", "$urlRouterProvider", "$ionicConfigProvider",
    function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
//        $ionicConfigProvider.views.maxCache(2);
        $stateProvider
                .state('offline', {
                    url: '/offline',
                    templateUrl: 'template/offline.html',
                    controller: 'MenuCtrl'
                })
                .state('app', {
                    url: '/app',
                    abstract: true,
                    templateUrl: 'template/menu.html',
                    controller: 'MenuCtrl'
                })
                .state('app.home', {
                    url: '/home',
                    abstract: true,
                    views: {
                        'menuContent': {
                            templateUrl: 'template/home.html',
                            controller: 'HomeCtrl'
                        }
                    }
                })
                .state('app.home.trending', {
                    url: '/trending',
                    views: {
                        'pin-content': {
                            templateUrl: 'template/list/pins.html',
                            controller: 'PinCtrl',
                            controllerAs :'trending'
                        }
                    }
                })
                .state('app.home.feed', {
                    url: '/feed',
                    views: {
                        'pin-content': {
                            templateUrl: 'template/list/pins.html',
                            controller: 'PinCtrl',
                            controllerAs :'feed'
                        }
                    }
                })
                .state('app.home.latest', {
                    url: '/latest',
                    views: {
                        'pin-content': {
                            templateUrl: 'template/category_home.html',
                            controller: 'HomeCatCtrl',
                            controllerAs :'latest'
                        }
                    }
                })
                .state('app.item', {
                    url: '/item/:item_id/:list_id',
                    views: {
                        'menuContent': {
                            templateUrl: 'template/wishlist_item.html',
                            controller: 'WishlistItemCtrl'
                        }
                    }
                })
                .state('app.category', {
                    url: '/category/:cat_id/:sub_cat_id/:name',
                    views: {
                        'menuContent': {
                            templateUrl: 'template/category.html',
                            controller: 'CategoryCtrl'
                        }
                    }
                })
                .state('app.product_search', {
                    url: '/category/:cat_id/:sub_cat_id/:name/:search_text',
                    views: {
                        'menuContent': {
                            templateUrl: 'template/category.html',
                            controller: 'CategoryCtrl'
                        }
                    }
                })
                .state('app.category_search', {
                    url: '/search/:father_key/:search',
                    views: {
                        'menuContent': {
                            templateUrl: 'template/category.html',
                            controller: 'CategoryCtrl'
                        }
                    }
                })
                .state('app.product', {
                    url: '/product/:product_id',
                    views: {
                        'menuContent': {
                            templateUrl: 'template/product.html',
                            controller: 'ProductCtrl'
                        }
                    }
                })
                .state('app.signup', {
                    url: '/signup',
                    views: {
                        'menuContent': {
                            templateUrl: 'template/register.html',
                            controller: 'RegisterCtrl'
                        }
                    }
                })
                .state('app.login', {
                    url: '/login',
                    views: {
                        'menuContent': {
                            templateUrl: 'template/login.html',
                            controller: 'RegisterCtrl'
                        }
                    }
                })
                .state('app.forgot', {
                    url: '/forgot',
                    views: {
                        'menuContent': {
                            templateUrl: 'template/forgot.html',
                            controller: 'RegisterCtrl'
                        }
                    }
                })
//                .state('app.account', {
//                    url: '/account',
//                    views: {
//                        'menuContent': {
//                            templateUrl: 'template/account.html',
//                            controller: 'AccountCtrl'
//                        }
//                    }
//                })
                .state('app.profile', {
                    url: '/profile/:user_id',
                    abstract: true,
                    views: {
                        'menuContent': {
                            templateUrl: 'template/profile.html',
                            controller: 'ProfileCtrl'
                        }
                    }
                })
                .state('app.profile.mine', {
                    url: '/mine',
                    views: {
                        'tab-content': {
                            templateUrl: 'template/profile/list_mine.html',
                            controller: 'ProfileListMineCtrl'
                        }
                    }
                })
                .state('app.profile.followers', {
                    url: '/followers',
                    views: {
                        'tab-content': {
                            templateUrl: 'template/profile/followers.html',
                            controller: 'ProfileFollowerCtrl'
                        }
                    }
                })
                .state('app.profile.following', {
                    url: '/following',
                    views: {
                        'tab-content': {
                            templateUrl: 'template/profile/following.html',
                            controller: 'ProfileFollowingCtrl'
                        }
                    }
                })
                .state('app.profile.pins', {
                    url: '/pins',
                    views: {
                        'tab-content': {
                            templateUrl: 'template/list/pins.html',
                            controller: 'PinCtrl'
                        }
                    }
                })
                .state('app.profile.profile', {
                    url: '/profile',
                    views: {
                        'tab-content': {
                            templateUrl: 'template/account.html',
                            controller: 'AccountCtrl'
                        }
                    }
                })
                .state('app.profile.update', {
                    url: '/update',
                    views: {
                        'tab-content': {
                            templateUrl: 'template/profile/update.html',
                            controller: 'ProfileUpdateCtrl'
                        }
                    }
                })
                .state('app.profile.friends', {
                    url: '/friends',
                    views: {
                        'tab-content': {
                            templateUrl: 'template/profile/friends.html',
                            controller: 'ProfileFriendCtrl'
                        }
                    }
                })
                .state('app.profile.recommended', {
                    url: '/recommended',
                    views: {
                        'tab-content': {
                            templateUrl: 'template/profile/recommended.html',
                            controller: 'ProfileRecommendedCtrl'
                        }
                    }
                })
                .state('app.wishlist_edit', {
                    url: '/wishlist_edit/:list_id', //needed for editing existing list
                    views: {
                        'menuContent': {
                            templateUrl: 'template/wishlist_new.html',
                            controller: 'WishlistNewCtrl'
                        }
                    }
                })
                .state('app.wishlist_add', {
                    url: '/wishlist_add', //needed for adding new list
                    views: {
                        'menuContent': {
                            templateUrl: 'template/wishlist_new.html',
                            controller: 'WishlistNewCtrl'
                        }
                    }
                })
                .state('app.wishlist_item', {
                    url: '/wishlist_item/:list_id/:list_name',
                    abstract: true,
                    views: {
                        'menuContent': {
                            templateUrl: 'template/wishlist_items.html',
                            controller: 'WishlistItemsCtrl'
                        }
                    }
                })
                .state('app.wishlist_item.pins', {
                    url: '/pins',
                    views: {
                        'pin-content': {
                            templateUrl: 'template/list/pins.html',
                            controller: 'PinCtrl'
                        }
                    }
                })
                .state('app.wishlist_item_add', {
                    url: '/wishlist_item_add/:list_id',
                    abstract: true,
                    views: {
                        'menuContent': {
                            templateUrl: 'template/wishlist_item_add.html',
                            controller: 'WishlistItemAddCtrl'
                        }
                    }
                })
                .state('app.wishlist_item_add.step1', {
                    url: '/step1',
                    views: {
                        'tab-content': {
                            templateUrl: 'template/item_add/step1.html'
                        }
                    }
                })
                .state('app.wishlist_item_add.step2', {
                    url: '/step2',
                    views: {
                        'tab-content': {
                            templateUrl: 'template/item_add/step2.html'
                        }
                    }
                })
                .state('app.invite', {
                    url: '/invite',
                    views: {
                        'menuContent': {
                            templateUrl: 'template/invite.html',
                            controller: 'InviteCtrl'
                        }
                    }
                })
                .state('app.feedback', {
                    url: '/feedback',
                    views: {
                        'menuContent': {
                            templateUrl: 'template/feedback.html',
                            controller: 'FeedbackCtrl'
                        }
                    }
                })
                .state('app.aboutus', {
                    url: '/aboutus',
                    views: {
                        'menuContent': {
                            templateUrl: 'template/about.html',
                            controller: 'FeedbackCtrl'
                        }
                    }
                });
        $urlRouterProvider.otherwise('/app/home/trending');
    }]);

var custom_history = [];

app.run(["$ionicPlatform", "$rootScope", "$localStorage", "$cordovaNetwork", "$cordovaSplashscreen", "$location", 'notifyHelper', '$cordovaNetwork', '$ionicHistory', '$timeout', 'toast', '$ionicLoading',
    function ($ionicPlatform, $rootScope, $localStorage, $cordovaNetwork, $cordovaSplashscreen, $location, notifyHelper, $cordovaNetwork, $ionicHistory, $timeout, toast, $ionicLoading) {
        console.log('angular ready');
        if (!$localStorage.user) {
            $localStorage.user = {};
        } else {
            if ($localStorage.user.id)
                if (window.analytics)
                    window.analytics.setUserId($localStorage.user.id)
        }
        $rootScope.isBackButton = false;
        $rootScope.isReady = function () {
            $rootScope.display = {display: "block"};
        };

        var backPress = 0;
        $ionicPlatform.registerBackButtonAction(function (e) {
            e.preventDefault();
            console.log('back pressseddddd');
            var history = $ionicHistory.backView();
            console.log(history);
            var backView = $ionicHistory.backView();
            $ionicLoading.hide();
            if (backView) {
                // there is a back view, go to it
                backView.go();
            } else {
                // there is no back view, so close the app instead

                if (backPress === 0) {
                    backPress++;
                    if ($location.path().indexOf('app/home') !== -1) {
                        $location.path('/app/home/trending');
                    }
                    toast.showShortBottom('Press Back Again To Exit');
                    $timeout(function () {
                        backPress = 0;
                    }, 3000);
                } else {
                    ionic.Platform.exitApp();
                }
            }
            return false;
        }, 101);
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                $cordovaSplashscreen.hide();
                $cordovaNetwork.watchOffline();
                $cordovaNetwork.watchOnline();
                window.analytics.startTrackerWithId('UA-58649556-1');
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
            notifyHelper.init();
        });
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            if ($cordovaNetwork.isOffline()) {
                $location.path('/offline');
                return;
            }
        }
        $rootScope.$on('networkOffline', function () {
            $location.path('/offline');
        });
        $rootScope.$on('networkOnline', function () {
            $location.path('/app/home');
        });
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            console.log(toState.name + " to state");
            console.log(fromState.name + "from state");
            $rootScope.body_class = '';
            if (toState.name === 'app.item' || toState.name.indexOf('app.home.trending') !== -1 || toState.name.indexOf('app.home.feed') !== -1 || toState.name.indexOf('app.profile') !== -1 || (toState.name.indexOf('app.wishlist_item') !== -1 && toState.name.indexOf('app.wishlist_item_add') === -1)) {
                $rootScope.body_class = 'grey_bg';
            }

            if (toState.name && toState.name === 'app.wishlist_item') {
                $rootScope.list_id = toParams.list_id;
            } else {
                $rootScope.list_id = false;
            }

            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                if ($cordovaNetwork.isOffline() && toState.name !== 'offline') {
                    return;
                }
                window.analytics.trackView(toState.name);
            }

            if ($localStorage.user) {
                if (!$localStorage.user.api_key) {
                    $localStorage.user = {};
                }
            }
            if (toState.name === 'app.signup' && fromState) {
                if (fromState.name !== "") {
                    var url = fromState.url;
                    if (fromParams && url) {
                        for (var key in fromParams) {
                            var value = fromParams[key];
                            url = url.replace(':' + key, value);
                        }
                        if (!$localStorage.previous) {
                            $localStorage.previous = {};
                        }
                        $localStorage.previous.url = '/app' + url;
                        console.log(url + 'set as previous url');
                    }

                }
            }
        });
    }]);

//this function is called when a url like http://fashioniq.in is opened
function handleOpenURL(url) {
    setTimeout(function () {
        var parser = document.createElement('a');
        parser.href = url;

        var elem = angular.element(document.querySelector('[ng-app]'));
        var injector = elem.injector();
        var $location = injector.get('$location');

        var path = parser.pathname;
        if (path.indexOf('m/p') !== -1) {
            //product
            var p = path.split('/');
            var last_index = p[p.length - 1];
            $location.path('/app/product/' + last_index);
        } else if (path.indexOf('m/i') !== -1) {
            var p = path.split('/');
            var last_index = p[p.length - 1];
            var second_last_index = p[p.length - 2];
            $location.path('/app/item/' + second_last_index + "/" + last_index);
        } else if (path.indexOf('m/l') !== -1) {
            var p = path.split('/');
            var last_index = p[p.length - 1];
            var second_last_index = p[p.length - 2];
            $location.path('/app/wishlist_item/' + second_last_index + "/" + last_index + '/pins');
        } else {
            console.log('invalid url' + url);
            window.open(url, '_system');
        }

        parser = null;
    }, 0);
}