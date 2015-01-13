var wishlistItemMod = angular.module('WishlistItemMod', ['ServiceMod', 'ngStorage', 'ionic', 'WishlistService', 'MapService', 'ItemService', 'FriendService']);

wishlistItemMod.controller('WishlistItemCtrl',
        ['$scope', '$localStorage', 'toast', 'wishlistHelper', '$location', '$stateParams', 'mapHelper', '$window', 'socialJs', 'itemHelper', 'friendHelper',
            function ($scope, $localStorage, toast, wishlistHelper, $location, $stateParams, mapHelper, $window, socialJs, itemHelper, friendHelper) {
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
                        $scope.me_pin = false;
                        $scope.me_like = false;
                        $scope.me_follow_user = false;
                        $scope.me_follow_list = false;
                        var ajax = wishlistHelper.viewItem($stateParams.item_id, $stateParams.list_id);
                        ajax.then(function (data) {

                            if (!data.likes) {
                                data.likes = [];
                            }
                            if (!data.item_id.pins) {
                                data.item_id.pins = [];
                            }
                            if (!data.list_id.followers) {
                                data.list_id.followers = [];
                            }
                            if (!data.user_id.followers) {
                                data.user_id.followers = [];
                            }
                            for (var i = 0; i < data.user_id.followers; i++) {
                                if (data.user_id.followers[i] == $localStorage.user.id) {
                                    $scope.me_follow_user = true;
                                }
                            }
                            for (var i = 0; i < data.list_id.followers; i++) {
                                if (data.list_id.followers[i] == $localStorage.user.id) {
                                    $scope.me_follow_list = true;
                                }
                            }
                            for (var i = 0; i < data.likes.length; i++) {
                                if (data.likes[i].user_id == $localStorage.user.id) {
                                    $scope.me_like = true;
                                    break;
                                }
                            }
                            for (var i = 0; i < data.item_id.pins.length; i++) {
                                if (data.item_id.pins[i].user_id == $localStorage.user.id) {
                                    $scope.me_pin = true;
                                    break;
                                }
                            }

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
                        $scope.unFollowUser = function (user_id) {
                            var ajax = friendHelper.user_follow(user_id);
                            ajax.then(function (data) {
                                var followers = $scope.user_id.followers;
                                var new_followers = [];
                                for (var i = 0; i < followers.length; i++) {
                                    if (followers[i].user_id != $localStorage.user.id) {
                                        new_followers.push(followers[i]);
                                    }
                                }
                                $scope.user_id.followers = new_followers;
                                $scope.me_follow_user = false;
                            });
                        }
                        $scope.followUser = function (user_id) {
                            var ajax = friendHelper.user_follow(user_id);
                            ajax.then(function (data) {
                                var followers = $scope.user_id.followers;
                                followers.push({
                                    user_id: $localStorage.user.id,
                                    created_at: new Date().getTime()
                                });
                                $scope.me_follow_user = true;
                            });
                        }
                        $scope.followList = function () {
                            var list_id = $scope.list_id;
                            var ajax = friendHelper.list_follow(list_id);
                            ajax.then(function (data) {
                                var followers = $scope.list_id.followers;
                                followers.push({
                                    user_id: $localStorage.user.id,
                                    created_at: new Date().getTime()
                                });
                                $scope.me_follow_list = true;
                            });
                        }
                        $scope.unFollowList = function () {
                            var list_id = $scope.list_id;
                            var ajax = friendHelper.list_follow(list_id, 'remove');
                            ajax.then(function (data) {
                                var followers = $scope.list_id.followers;
                                var new_followers = [];
                                for (var i = 0; i < followers.length; i++) {
                                    if (followers[i].user_id != $localStorage.user.id) {
                                        new_followers.push(followers[i]);
                                    }
                                }
                                $scope.list_id.followers = new_followers;
                                $scope.me_follow_list = false;
                            });
                        }
                        $scope.unlike = function () {
                            var item_id = $scope.item_id;
                            var list_id = $scope.list_id;
                            var ajax = itemHelper.like(item_id, list_id, 'remove');
                            ajax.then(function (data) {
                                var likes = $scope.item.likes;
                                if (!likes) {
                                    likes = [];
                                }
                                var new_likes = [];
                                for (var i = 0; i < likes.length; i++) {
                                    if (likes[i].user_id != $localStorage.user.id)
                                    {
                                        new_likes.push(likes[i]);
                                    }
                                }
                                $scope.me_like = false;
                                $scope.item.likes = new_likes;
                            });
                        }
                        $scope.like = function () {
                            var item_id = $scope.item_id;
                            var list_id = $scope.list_id;
                            var ajax = itemHelper.like(item_id, list_id);
                            ajax.then(function (data) {
                                var likes = $scope.item.likes;
                                if (!likes) {
                                    likes = [];
                                }
                                likes.push({
                                    user_id: $localStorage.user.id,
                                    created_at: new Date().getTime()
                                });
                                $scope.me_like = true;
                                $scope.item.likes = likes;
                            });
                        }
                        $scope.pin = function () {
                            var item_id = $scope.item_id;
                            var list_id = $scope.list_id;
                            var ajax = itemHelper.pin(item_id, list_id);
                            ajax.then(function (data) {
                                var pins = $scope.item.item_id.pins;
                                if (!pins) {
                                    pins = [];
                                }
                                pins.push({
                                    user_id: $localStorage.user.id,
                                    created_at: new Date().getTime()
                                });
                                $scope.me_pin = true;
                                $scope.item.item_id.pins = pins;
                            });
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