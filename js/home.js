var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic', 'pasvaz.bindonce', 'ionicLazyLoad', 'UrlService']);
homeMod.controller('HomeCtrl',
        ['$scope', 'friendHelper', '$ionicNavBarDelegate', '$rootScope', '$ionicScrollDelegate', '$localStorage', '$interval', '$ionicPlatform', '$timeout', '$state', 'urlHelper', '$q',
            function ($scope, friendHelper, $ionicNavBarDelegate, $rootScope, $ionicScrollDelegate, $localStorage, $interval, $ionicPlatform, $timeout, $state, urlHelper, $q) {
                var self = this;
                $timeout(function () {
                    $ionicNavBarDelegate.align('left');
                });
                self.skipGetData = false;
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
                    var path = urlHelper.getPath();
                    if (path === '/app/home/trending') {
                        self.type = 'trending';
                        $scope.selected_class = 'trending';
                        $scope.bg_col = 'none';
                    } else if (path === '/app/home/feed') {
                        $scope.selected_class = 'feed';
                        self.type = 'feed';
                        $scope.bg_col = 'none';
                    } else if (path === '/app/home/latest') {
                        $scope.selected_class = 'latest';
                        self.type = 'latest';
                        $scope.bg_col = '1px solid #eee7dd';
                    }
                };
                self.init();

                $scope.$on("$ionicView.beforeEnter", function () {
                    self.skipGetData = false;
                    console.log('view entire skip get data false');
                });
                $scope.$on("$ionicView.enter", function () {
                    //self.init();
                    $ionicScrollDelegate.scrollTop();
                });
                $scope.$on('$ionicView.leave', function () {
                    self.skipFeedCheck = true;
                    self.skipGetData = true;
                    $scope.$emit('has_no_more');
                    console.log('view leave skip get data true');
                });
                $ionicPlatform.on('offline', function () {
                    self.skipFeedCheck = true;
                    self.skipGetData = true;
                    $scope.$emit('has_no_more');
                    console.log('offline skip get data false');
                });
                $ionicPlatform.on('pause', function () {
                    self.skipFeedCheck = true;
                    self.skipGetData = true;
                    $scope.$emit('has_no_more');
                    console.log('pause skip get data false');
                });
                $ionicPlatform.on('resume', function () {
                    if ($localStorage.user.id) {
                        self.skipFeedCheck = false;
                    }
                    self.skipGetData = false;
                    console.log('resume skip get data false');
                });
                self.checkFeedCount = function () {
                    if (self.skipGetData) {
                        console.log('skipping feed count');
                        return false;
                    }
                    var ajax = friendHelper.home_feed_count();
                    ajax.then(function (data) {
                        $scope.feed_unread = data;
                    });
                };
                self.checkLatestCount = function () {
                    if (self.skipGetData) {
                        console.log('skipping latest count');
                        return false;
                    }
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
                if (ionic.Platform.isWebView()) {
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
                }
                $ionicPlatform.on('online', function () {
                    if ($localStorage.user.id) {
                        self.skipFeedCheck = false;
                    }
                    self.skipGetData = false;
                    console.log('online skip get data false');
                });

                $scope.$on('$destroy', function () {
                    $interval.cancel(feed_interval);
                    $interval.cancel(latest_interval);
                });
                var self = this;
                self.women = true;
                if ($localStorage.latest_show && $localStorage.latest_show == 'men') {
                    self.women = false;
                }

                $scope.getData = function (page) {
                    if (self.skipGetData) {
                        console.log('skipping feed data');
                        return $q.when([]);
                    }
                    console.log('get data called');
                    var path = urlHelper.getPath();
                    if (path === '/app/home/trending') {
                        self.type = 'trending';
                        $scope.selected_class = 'trending';
                        $scope.bg_col = 'none';
                    } else if (path === '/app/home/feed') {
                        $scope.selected_class = 'feed';
                        self.type = 'feed';
                        // $ionicNavBarDelegate.title('My Feed');
                    } else if (path === '/app/home/latest') {
                        $scope.selected_class = 'latest';
                        self.type = 'latest';
                    }
                    if (self.type === 'trending') {
                        return friendHelper.home_trending(page);
                    } else if (self.type === 'feed') {
                        if (page == 0) {
                            $scope.feed_unread = 0;
                        }
                        return friendHelper.home_feed(page);
                    } else {
                        return friendHelper.home_latest(page, self.women);
                    }
                };

                $scope.doRefresh = function () {
                    $scope.$broadcast('reload_pins');
                };

                $scope.showMen = function () {
                    $localStorage.latest_show = 'men';
                    self.women = false;
                    $scope.$broadcast('reload_pins');
                    console.log('men');
                    //$scope.$broadcast('show_men');
                };
                $scope.showWomen = function () {
                    $localStorage.latest_show = 'women';
                    self.women = true;
                    $scope.$broadcast('reload_pins');
                    console.log('women');
                    //$scope.$broadcast('show_women');
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
                    //urlHelper.openHomePage();
                    $state.go('app.home.trending');
                    $ionicScrollDelegate.resize();
                    if (window.analytics) {
                        window.analytics.trackEvent('Home Page', 'Trending');
                    }
                };
                $scope.menu_feed = function () {
                    $scope.selected_class = 'feed';
                    self.type = 'feed';
                    $scope.bg_col = 'none';
                    $state.go('app.home.feed');
                    //$ionicNavBarDelegate.title('My Feed');
                    $ionicScrollDelegate.resize();
                    if (window.analytics) {
                        window.analytics.trackEvent('Home Page', 'Feed');
                    }
                };
                $scope.menu_latest = function () {
                    $scope.selected_class = 'latest';
                    $scope.bg_col = '1px solid #eee7dd';
                    self.type = 'latest';
                    $state.go('app.home.latest');
                    // $ionicNavBarDelegate.title('Latest');
                    // $ionicScrollDelegate.resize();
                    if (window.analytics) {
                        window.analytics.trackEvent('Home Page', 'Latest');
                    }
                };
            }
        ]);