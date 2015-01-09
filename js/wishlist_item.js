var wishlistItemMod = angular.module('WishlistItemMod', ['ServiceMod', 'ngStorage', 'ionic', 'WishlistService']);

wishlistItemMod.controller('WishlistItemCtrl',
        ['$scope', '$localStorage', 'toast', 'wishlistHelper', '$location', 'dataShare', '$stateParams',
            function ($scope, $localStorage, toast, wishlistHelper, $location, dataShare, $stateParams) {
                if ($localStorage.user.id) {
                    $scope.wishlist = [];
                    $scope.loading = true;
                    $scope.items = [];
                    if ($stateParams.list_id) {
                        var ajax = wishlistHelper.listItems($stateParams.list_id);
                        ajax.then(function (data) {
                            $scope.items = data;
                            if (data.length == 0) {
                                toast.showShortBottom('Not Items Found In Wishlist');
                            }
                            $scope.loading = false;
                        }, function () {
                            $scope.loading = false;
                        });
                    }

                } else {
                    toast.showShortBottom('You Need To Be Logged In To Access This Page');
                    $location.path('/app/register');
                }
            }
        ]);