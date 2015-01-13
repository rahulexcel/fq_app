var wishlistItemMod = angular.module('WishlistItemMod', ['ServiceMod', 'ngStorage', 'ionic', 'WishlistService', 'MapService']);

wishlistItemMod.controller('WishlistItemCtrl',
        ['$scope', '$localStorage', 'toast', 'wishlistHelper', '$location', '$stateParams', 'mapHelper', '$window', 'socialJs',
            function ($scope, $localStorage, toast, wishlistHelper, $location, $stateParams, mapHelper, $window, socialJs) {
                if ($localStorage.user.id) {
                    $scope.wishlist = [];
                    $scope.loading = true;
                    $scope.items = [];
                    $scope.$on('$destroy', function () {
                        mapHelper.destroy();
                    })
                    var picture_width = $window.innerWidth;
                    picture_width = Math.ceil(picture_width * .95);
                    $scope.picture_width = picture_width;
                    if ($stateParams.item_id) {
                        $scope.item_id = $stateParams.item_id;
                        $scope.list_id = $stateParams.list_id;
                        var ajax = wishlistHelper.viewItem($stateParams.item_id, $stateParams.list_id);
                        ajax.then(function (data) {
                            $scope.item = data;
                            if (data.location && data.location.lat) {
                                mapHelper.showMap(data.location);
                            }
                            $scope.loading = false;
                        }, function () {
                            $scope.loading = false;
                        });

                        if (window.plugins && window.plugins.socialsharing) {
                            $scope.isMobile = true;

                            $scope.shareAll = function (product) {
                                window.plugins.socialsharing.share(product.name, null, product.picture, product.href, function () {
                                }, function () {
                                    toast.showShortBottom('Unable to Share');
                                })
                            }
                            $scope.twitter = function (product) {
                                window.plugins.socialsharing.shareViaTwitter(
                                        product.name, product.picture, product.href, function () {
                                        }, function () {
                                    toast.showShortBottom('Unable to Share');
                                });
                            }
                            $scope.whatsapp = function (product) {
                                window.plugins.socialsharing.shareViaWhatsApp(
                                        product.name, product.picture, product.href, function () {
                                        }, function () {
                                    toast.showShortBottom('Unable to Share');
                                });
                            }

                            $scope.facebook = function (product) {
                                if (window.cordova.platformId == "browser") {
                                    if (!accountHelper.isFbInit()) {
                                        facebookConnectPlugin.browserInit('765213543516434');
                                        accountHelper.fbInit();
                                    }
                                }
                                facebookConnectPlugin.showDialog({
                                    method: 'share',
                                    href: product.href,
                                    message: product.name,
                                    picture: product.picture
                                }, function (data) {
                                    console.log(data);
                                }, function (data) {
                                    console.log(data);
                                    toast.showShortBottom('Unable to Share');
                                })

                            }
                        } else {
                            $scope.isMobile = false;
                            socialJs.addSocialJs();
                        }

                        $scope.view = function (item) {
                            if (item.product_id)
                                $location.path('/app/product/' + item.product_id);
                        }
                        $scope.like = function(){
                            
                        }

                    } else if ($stateParams.list_id) {
                        $scope.wishlist_name = $stateParams.list_name;
                        $scope.list_id = $stateParams.list_id;
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
                        $scope.viewItem = function (item) {
                            console.log(item);
                            var item_id = item._id;
//                            console.log('/app/item/' + item_id + "/" + $scope.list_id);
                            $location.path('/app/item/' + item_id + "/" + $scope.list_id);
                        }
                    }
                    $scope.buy = function (product) {
                        if (window.plugins) {
                            window.open(product.href, '_system');
                        } else {
                            window.open(product.href);
                        }
                    }
                } else {
                    toast.showShortBottom('You Need To Be Logged In To Access This Page');
                    $location.path('/app/register');
                }
            }
        ]);