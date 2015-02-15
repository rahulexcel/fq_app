var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic', 'pasvaz.bindonce']);

homeMod.controller('HomeCtrl',
        ['$scope', 'friendHelper', '$timeout',
            function ($scope, friendHelper, $timeout) {
                var self = this;
                self.type = 'trending';
                $scope.selected_class = 'trending';
                $scope.getData = function (page) {
                    if (self.type === 'trending') {
                        return friendHelper.home_trending(page);
                    } else if (self.type === 'feed') {
                        return friendHelper.home_feed(page);
                    } else {
                    }
                };


                $scope.menu_trending = function () {
                    self.type = 'trending';
                    $scope.selected_class = 'trending';
                };
                $scope.menu_feed = function () {
                    $scope.selected_class = 'feed';
                    self.type = 'feed';
                };
                $scope.menu_latest = function () {
                    $scope.selected_class = 'latest';
                    self.type = 'latest';
                };
            }
        ]);