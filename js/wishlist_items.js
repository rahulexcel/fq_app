var wishlistItemsMod = angular.module('WishlistItemsMod', ['ServiceMod', 'ngStorage', 'ionic']);
wishlistItemsMod.controller('WishlistItemsCtrl',
        ['$scope', '$localStorage', 'toast', 'wishlistHelper', '$location', '$stateParams', '$ionicLoading',
            function ($scope, $localStorage, toast, wishlistHelper, $location, $stateParams, $ionicLoading) {
                if ($stateParams.list_id) {
                    $scope.wishlist_name = $stateParams.list_name;
                    $scope.list_id = $stateParams.list_id;
                    var ajax = wishlistHelper.listItems($stateParams.list_id);
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    ajax.then(function (data) {
                        $ionicLoading.hide();

                        $scope.list = data.list;
                        if ($localStorage.user.id) {
                            if (data.list.user_id === $localStorage.user.id) {
                                $scope.mein = true;
                            }
                        }

                        $scope.items = data.items;
                        if (data.length === 0) {
                            toast.showShortBottom('Not Items Found In Wishlist');
                        }
                        $scope.loading = false;
                    }, function () {
                        $ionicLoading.hide();
                        $scope.loading = false;
                    });
                    $scope.delete = function (item_id) {
                        var ajax = wishlistHelper.remove(item_id, $scope.list_id);
                        $ionicLoading.show({
                            template: 'Loading...'
                        });
                        ajax.finally(function () {
                            $ionicLoading.hide();
                        });
                    }
                    $scope.viewItem = function (item) {
                        var item_id = item._id;
//                            console.log('/app/item/' + item_id + "/" + $scope.list_id);
                        $location.path('/app/item/' + item_id + "/" + $scope.list_id);
                    };
                }
            }
        ]);