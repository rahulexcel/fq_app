var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic', 'pasvaz.bindonce', 'ionicLazyLoad']);
//
//
//homeMod.directive('myDirective2', function () {
//    return {
//        restrict: 'E',
//        compile: function (tElem, tAttrs) {
//            console.log(': compile2');
//            console.log(tElem.html());
//            console.log(tAttrs);
//
//            return {
//                pre: function (scope, iElem, iAttrs) {
//                    console.log(': pre2 link');
//                    console.log(iElem.html());
//                },
//                post: function (scope, iElem, iAttrs) {
//                    console.log(': post2 link');
//                    console.log(iElem.html());
//                }
//            }
//        }
//    }
//});
//
//
//homeMod.directive('myDirective', function ($compile) {
//    return {
//        restrict: 'E',
//        scope: {},
//        compile: function (tElem, tAttrs) {
//            console.log(': compile' + tAttrs.myAttr);
//
//            return {
//                pre: function (scope, iElem, iAttrs) {
//                    console.log(': pre link');
//                },
//                post: function (scope, iElem, iAttrs) {
//                    console.log(iAttrs);
//                    console.log(': post link');
//                    var html = $compile('<div>Hello How Are You Doing ' + iAttrs.myAttr + ' by {{new_dyn}} </div>')(scope);
//                    iElem.append(html);
//
//                    iAttrs.$observe('dynamic', function (val) {
//                        console.log('dynamic changing');
//                        scope.new_dyn = val;
//                    });
//
////                    scope.$watch('dynamic', function (val) {
////                        console.log('watch dynamic changing');
////                        
////                    });
//
//                }
//            }
//        }
//    }
//});
homeMod.controller('HomeCtrl',
        ['$scope', 'friendHelper', '$location', '$ionicNavBarDelegate', '$rootScope', '$ionicScrollDelegate', '$localStorage', '$interval', '$ionicPlatform', '$timeout', '$state',
            function ($scope, friendHelper, $location, $ionicNavBarDelegate, $rootScope, $ionicScrollDelegate, $localStorage, $interval, $ionicPlatform, $timeout, $state) {
//                $scope.dynamic = '';
//                $scope.xyz = '123';

                var self = this;

                self.init = function () {
                    self.type = 'trending';
                    $scope.selected_class = 'trending';
                    $scope.bg_col = 'none';
                    self.skipFeedCheck = true;
                    if ($localStorage.user.id) {
                        self.skipFeedCheck = false;
                    }
                    $scope.feed_unread = 0;
                    $scope.latest_uread = 0;
                    var path = $location.path();
                    if (path === '/app/home/trending') {
                        self.type = 'trending';
                        $scope.selected_class = 'trending';
                        $scope.bg_col = 'none';
                        $ionicNavBarDelegate.title('Trending');
                    } else if (path === '/app/home/feed') {
                        $scope.selected_class = 'feed';
                        self.type = 'feed';
                        $scope.bg_col = 'none';
                        $ionicNavBarDelegate.title('My Feed');
                    } else if (path === '/app/home/latest') {
                        $scope.selected_class = 'latest';
                        self.type = 'latest';
                        $scope.bg_col = '1px solid #eee7dd';
                        $ionicNavBarDelegate.title('Latest');
                    }
                };
                self.init();

                $rootScope.$on("$ionicView.enter", function () {
                    self.init();
                });
                $rootScope.$on('$ionicView.leave', function () {
                    self.skipFeedCheck = false;
                });

                self.checkFeedCount = function () {
                    var ajax = friendHelper.home_feed_count();
                    ajax.then(function (data) {
                        $scope.feed_unread = data;
                    });
                };
                self.checkLatestCount = function () {
                    console.log(self.skipFeedCheck + "skip feed check");
                    var father = 'women';
                    if ($localStorage.latest_show && $localStorage.latest_show === 'men') {
                        father = 'men';
                    }
                    var ajax2 = friendHelper.home_latest_count(father);
                    ajax2.then(function (data) {
                        $scope.latest_uread = data;
                    });
                };
                $timeout(function () {
                    if (!self.skipFeedCheck) {
                        self.checkFeedCount();
                        self.checkLatestCount();
                    }
                });
                var feed_interval = $interval(function () {
                    if (!self.skipFeedCheck) {
                        self.checkFeedCount();
                    }
                }, 10000);
                var latest_interval = $interval(function () {
                    if (!self.skipFeedCheck) {
                        self.checkLatestCount();
                    }
                }, 60000 * 15);
                $ionicPlatform.on('pause', function () {
                    self.skipFeedCheck = true;
                });
                $ionicPlatform.on('resume', function () {
                    self.skipFeedCheck = false;
                });
                $scope.$on('$destroy', function () {
                    $interval.cancel(feed_interval);
                    $interval.cancel(latest_interval);
                });

                $scope.getData = function (page) {
                    console.log('get data called');
                    var path = $location.path();
                    if (path === '/app/home/trending') {
                        self.type = 'trending';
                        $scope.selected_class = 'trending';
                        $scope.bg_col = 'none';
                        $ionicNavBarDelegate.title('Trending');
                    } else if (path === '/app/home/feed') {
                        $scope.selected_class = 'feed';
                        self.type = 'feed';
                        $ionicNavBarDelegate.title('My Feed');
                    } else if (path === '/app/home/latest') {
                        $scope.selected_class = 'latest';
                        self.type = 'latest';
                        $ionicNavBarDelegate.title('Latest');
                    }
                    if (self.type === 'trending') {
                        return friendHelper.home_trending(page);
                    } else if (self.type === 'feed') {
                        if (page == 0) {
                            $scope.feed_unread = 0;
                        }
                        return friendHelper.home_feed(page);
                    } else {
                    }
                };

                $scope.showMen = function () {
                    $localStorage.latest_show = 'men';
                    $scope.$broadcast('show_men');
                };
                $scope.showWomen = function () {
                    $localStorage.latest_show = 'women';
                    $scope.$broadcast('show_women');
                };

                $scope.loadTopUsers = function () {
                    return friendHelper.top_users(0);
                };
                $scope.loadTopLists = function () {
                    return friendHelper.top_lists(0);
                };

                $scope.menu_trending = function () {
                    self.type = 'trending';
                    $scope.bg_col = 'none';
                    $scope.selected_class = 'trending';
                    //$location.path('/app/home/trending');
                    $state.go('app.home.trending');
                    $ionicNavBarDelegate.title('Trending');
                    $ionicScrollDelegate.resize();
                    if (window.analytics) {
                        window.analytics.trackEvent('Home Page', 'Trending');
                    }
                };
                $scope.menu_feed = function () {
                    $scope.selected_class = 'feed';
                    self.type = 'feed';
                    $scope.bg_col = 'none';
//                    $location.path('/app/home/feed');
                    $state.go('app.home.feed');
                    $ionicNavBarDelegate.title('My Feed');
                    $ionicScrollDelegate.resize();
                    if (window.analytics) {
                        window.analytics.trackEvent('Home Page', 'Feed');
                    }
                };
                $scope.menu_latest = function () {
                    $scope.selected_class = 'latest';
                    $scope.bg_col = '1px solid #eee7dd';
                    self.type = 'latest';
//                    $location.path('/app/home/latest');
                    $state.go('app.home.latest');
                    $ionicNavBarDelegate.title('Latest');
                    $ionicScrollDelegate.resize();
                    if (window.analytics) {
                        window.analytics.trackEvent('Home Page', 'Latest');
                    }
                };
            }
        ]);