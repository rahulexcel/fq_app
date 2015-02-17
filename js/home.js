var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic', 'pasvaz.bindonce']);

homeMod.controller('HomeCtrl',
        ['$scope', 'friendHelper', '$location', '$ionicNavBarDelegate', '$rootScope', '$ionicScrollDelegate',
            function ($scope, friendHelper, $location, $ionicNavBarDelegate, $rootScope, $ionicScrollDelegate) {
                var self = this;
                self.type = 'trending';
                $scope.selected_class = 'trending';
                $scope.getData = function (page) {
                    var path = $location.path();
                    if (path === '/app/home/trending') {
                        self.type = 'trending';
                        $scope.selected_class = 'trending';
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

                $scope.loadTopUsers = function () {
                    return friendHelper.top_users(0);
                };
                $scope.loadTopLists = function () {
                    return friendHelper.top_lists(0);
                };

                $scope.menu_trending = function () {
                    self.type = 'trending';
                    $scope.selected_class = 'trending';
                    $location.path('/app/home/trending');
                    $ionicNavBarDelegate.title('Trending');
                    $ionicScrollDelegate.resize();
                };
                $scope.menu_feed = function () {
                    $scope.selected_class = 'feed';
                    self.type = 'feed';
                    $location.path('/app/home/feed');
                    $ionicNavBarDelegate.title('My Feed');
                    $ionicScrollDelegate.resize();
                };
                $scope.menu_latest = function () {
                    $scope.selected_class = 'latest';
                    self.type = 'latest';
                    $location.path('/app/home/latest');
                    $ionicNavBarDelegate.title('Latest');
                    $ionicScrollDelegate.resize();
                };
            }
        ]);