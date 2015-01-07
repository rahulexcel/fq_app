var wishlistnewMod = angular.module('WishlistNewMod', ['ServiceMod', 'ngStorage', 'ionic', 'WishlistService']);

wishlistnewMod.controller('WishlistNewCtrl',
        ['$scope', 'ajaxRequest', '$localStorage', 'toast', 'wishlistHelper',
            function ($scope, ajaxRequest, $localStorage, toast, wishlistHelper) {
                if ($localStorage.user.id) {
                    
                } else {
                    toast.showShortBottom('You Need To Be Logged In To Access This Page');
                }
                
                
            }
        ]);