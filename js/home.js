var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic']);

homeMod.controller('HomeCtrl',
        ['$scope', 'friendHelper',
            function ($scope, friendHelper) {
                $scope.social_data = [];
                $scope.loading = true;
                var ajax = friendHelper.home();
                ajax.then(function (data) {
                    $scope.social_data = data;
                    $scope.loading = false;
                }, function () {
                    $scope.loading = false;
                });

                var pin_width = 240;
                var actual_pin_width = 236;
                var window_width = document.querySelector('.pin_list_container').clientWidth;
                var pin_column = Math.floor(window_width / pin_width);
                if (pin_column === 0) {
                    pin_column = 1;
                } else if (pin_column < 2) {
                    pin_width = (window_width) / 2;
                    actual_pin_width = pin_width - 4;
                    pin_column = 2;
                }
                var pin_list_width = pin_width * pin_column;
                angular.element(document.querySelector('.pin_list')).attr('style', 'width:' + pin_list_width + 'px;margin:0px auto');

                $scope.getItemWidth = function (actual) {
                    if (actual) {
                        return actual_pin_width + "px";
                    } else {
                        return pin_width + "px";
                    }
                }


                $scope.getItemHeight = function (pin, padding, only_image) {
                    var ret = 0;
                    if (pin.dimension && pin.dimension.height) {
                        var height = pin.dimension.height;
                        var width = pin.dimension.width;
                        var pin_width = actual_pin_width;
                        ret = Math.ceil((height / width) * pin_width) + 100;
                    } else {
                        ret = 250 + 100;
                    }
                    if (only_image) {
                        return (ret - 100) + "px";
                    } else
                    if (padding) {
                        return (ret + 5) + "px";
                    } else {
                        return (ret) + "px";
                    }
                };
            }
        ]);