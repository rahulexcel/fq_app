var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic']);

homeMod.controller('HomeCtrl',
        ['$scope', 'friendHelper', '$ionicLoading',
            function ($scope, friendHelper, $ionicLoading) {
                $scope.social_data = [];
                $scope.loading = true;
                var ajax = friendHelper.home();
                ajax.then(function (data) {
                    $scope.social_data = data;
                    $scope.loading = false;
                }, function () {
                    $scope.loading = false;
                });

                $scope.getItemHeight = function (pin, index) {
                    if (pin.dimension.height) {
                        var height = pin.dimension.height;
                        var width = pin.dimension.width;
                        var pin_width = 236;
                    }
                }
            }
        ]);