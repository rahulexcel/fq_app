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
        ['$scope', 'friendHelper', '$location', '$ionicNavBarDelegate', '$rootScope', '$ionicScrollDelegate',
            function ($scope, friendHelper, $location, $ionicNavBarDelegate, $rootScope, $ionicScrollDelegate) {
                $scope.dynamic = '';
                $scope.xyz = '123';



                var self = this;
                self.type = 'trending';
                $scope.selected_class = 'trending';
                $scope.bg_col = 'none';
                $scope.getData = function (page) {
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
                        return friendHelper.home_feed(page);
                    } else {
                    }
                };

                $rootScope.$on('$viewContentLoaded', function (event) {
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
                });

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
                    $location.path('/app/home/trending');
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
                    $location.path('/app/home/feed');
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
                    $location.path('/app/home/latest');
                    $ionicNavBarDelegate.title('Latest');
                    $ionicScrollDelegate.resize();
                    if (window.analytics) {
                        window.analytics.trackEvent('Home Page', 'Latest');
                    }
                };
            }
        ]);