var homecatMod = angular.module('HomeCatMod', ['ServiceMod']);

homecatMod.controller('HomeCatCtrl',
        ['$scope', 'friendHelper', 'ajaxRequest', 'CDN',
            function ($scope, friendHelper, ajaxRequest, CDN) {
                $scope.currentState = {};
                $scope.product_loading = false;
                $scope.showProducts = false;
                $scope.page = 0;
                $scope.products = [];
                var self = this;
                $scope.nextPage = function () {
                    $scope.page++;
                    self.fetchProduct();
                };
                $scope.refreshCategory = function () {
                    $scope.page = 0;
                    $scope.products = [];
                    self.fetchProduct();
                };
                self.fetchProduct = function () {
                    var page = $scope.page;
                    $scope.product_loading = true;
                    var ajax = friendHelper.home_latest(page);
                    ajax.then(function (data) {
                        $scope.product_loading = false;
                        if (data.length === 0) {
                            $scope.showProducts = false;
                        } else {
                            $scope.showProducts = true;
                        }
                        var products = $scope.products;
                        for (var i = 0; i < data.length; i++) {
                            var image = data[i]._id;
                            data[i].img = CDN.cdnize(ajaxRequest.url('v1/picture/images/' + image));
                            products.push(data[i]);
                        }
                        $scope.products = products;
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }, function () {
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.product_loading = false;
                        $scope.showProducts = false;
                    });
                };
                self.fetchProduct();
            }
        ]);