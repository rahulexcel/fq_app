var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic']);

homeMod.controller('HomeCtrl',
        ['$scope', 'friendHelper', '$ionicLoading',
            function ($scope, friendHelper, $ionicLoading) {
                $scope.social_data = [];
                $ionicLoading.show({
                    template: 'Loading...'
                })
                var ajax = friendHelper.home();
                ajax.then(function (data) {
                    $scope.social_data = data;
                    $ionicLoading.hide();
                }, function () {
                    $ionicLoading.hide();
                });
            }
        ]);