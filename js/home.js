var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic','pasvaz.bindonce']);

homeMod.controller('HomeCtrl',
        ['$scope', 'friendHelper',
            function ($scope, friendHelper) {
                $scope.getData = function (page) {
                    return friendHelper.home(page);
                };
            }
        ]);