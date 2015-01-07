var wishlistMod = angular.module('WishlistMod', ['ServiceMod', 'ngStorage', 'ionic', 'WishlistService']);

wishlistMod.controller('WishlistCtrl',
        ['$scope', 'ajaxRequest', '$localStorage', 'toast', 'wishlistHelper',
            function ($scope, ajaxRequest, $localStorage, toast, wishlistHelper) {
                if ($localStorage.user.id) {
                    $scope.wishlist = [];
                    var ajax = wishlistHelper.list();
                    ajax.then(function (data) {
                        $scope.wishlist = data;
                    });
                } else {
                    toast.showShortBottom('You Need To Be Logged In To Access This Page');
                }
            }
        ]);