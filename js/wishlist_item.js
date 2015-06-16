var wishlistItemMod = angular.module('WishlistItemMod', ['ServiceMod', 'ngStorage', 'ionic', 'WishlistService', 'MapService', 'ItemService', 'FriendService', 'UrlService']);
wishlistItemMod.controller('WishlistItemCtrl',
        ['$scope', '$ionicPopup','$cordovaDevice', '$cordovaAppVersion','$localStorage', 'toast', 'wishlistHelper', '$ionicScrollDelegate', 'mapHelper', '$window', 'socialJs', 'itemHelper', 'friendHelper', 'timeStorage', '$ionicLoading', '$ionicModal', '$ionicSlideBoxDelegate', 'productHelper', 'CDN', '$q', '$ionicPosition', '$window', '$state', 'urlHelper', '$timeout', 'ajaxRequest', '$rootScope', 'accountHelper', 'dataShare',
            function ($scope,$ionicPopup,$cordovaDevice,$cordovaAppVersion, $localStorage, toast, wishlistHelper, $ionicScrollDelegate, mapHelper, $window, socialJs, itemHelper, friendHelper, timeStorage, $ionicLoading, $ionicModal, $ionicSlideBoxDelegate, productHelper, CDN, $q, $ionicPosition, $window, $state, urlHelper, $timeout, ajaxRequest, $rootScope, accountHelper, dataShare) {

                $scope.$on('$ionicView.enter', function () {
                    $ionicScrollDelegate.resize();
                    $ionicScrollDelegate.scrollTop();
                });
                $scope.$on('modal.shown', function () {
                    $rootScope.$emit('hide_android_add');
                });
                $scope.$on('modal.hidden', function () {
                    $rootScope.$emit('show_android_add');
                });
                $scope.wishlist = [];
                $scope.loading = true;
                $scope.items = [];
                var page = 0;
                var ajax = false;
                $scope.$on('logout_event', function () {
                    urlHelper.openSignUp();
                });
                $scope.login = $localStorage.user;

                $scope.$on('$stateChangeSuccess', function () {
                    $scope.item_id = $state.params.item_id;
                    $scope.list_id = $state.params.list_id;
                    $scope.me_pin = false;
                    $scope.me_like = false;
                    $scope.me_follow_user = false;
                    $scope.me_follow_list = false;
                    $scope.clip_loading = false;
                    $scope.request_process = false;
                    $scope.similar = [];
                    $scope.product_id = '';
                    page = 0;
                    $ionicScrollDelegate.scrollTop();
                    $scope.start();
                });

                $scope.$on('$destroy', function () {
                    mapHelper.destroy();
                });
                $scope.$on('logout_event', function () {
                    $scope.me_pin = false;
                    $scope.me_like = false;
                    $scope.me_follow_user = false;
                    $scope.me_follow_list = false;
                });
                $scope.fetchLatest = function (href) {
                    if (!href) {
                        return;
                    }
                    var ajax2 = productHelper.fetchLatest(href);
                    ajax2.then(function (data) {
                        var price = data.price;
                        var more_images = data.more_images;
                        price = Math.round(price);
                        if (price > 0)
                            $scope.item.item_id.price = price;
                        if (more_images && more_images.length > 0) {
                            $scope.item.item_id.more_images = more_images;
                            $scope.zoom_images = more_images;
                        } else {
                        }
                        $ionicSlideBoxDelegate.update();
                    });
                };
                var picture_width = $window.innerWidth;
                picture_width = Math.ceil(picture_width * 0.95);
                $scope.picture_width = picture_width;
                $scope.mine = false;
                if ($state.params.item_id) {
                    $scope.item_id = $state.params.item_id;
                    $scope.list_id = $state.params.list_id;
                    $scope.me_pin = false;
                    $scope.me_like = false;
                    $scope.me_follow_user = false;
                    $scope.me_follow_list = false;
                    $scope.clip_loading = false;
                    $scope.request_process = false;
                }
                var self = this;
                $scope.show_loves_count = 0;
                $scope.checkData = function (data) {
                    if (!data._id) {
                        toast.showShortBottom('Looks Like Clip Has Been Deleted By Owner');
                        urlHelper.openHomePage();
                    } else {

                        if ($localStorage.user.id)
                            if (data.list_id.user_id === $localStorage.user.id) {
                                $scope.mine = true;
                            }


                        if (!data.list_id.products) {
                            data.list_id.products = [];
                        }
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
                        var i = 0;
                        for (i = 0; i < data.user_id.followers.length; i++) {
                            if (data.user_id.followers[i] === $localStorage.user.id) {
                                $scope.me_follow_user = true;
                            }
                        }
                        for (i = 0; i < data.list_id.followers.length; i++) {
                            if (data.list_id.followers[i] === $localStorage.user.id) {
                                $scope.me_follow_list = true;
                            }
                        }
                        for (i = 0; i < data.likes.length; i++) {
                            if (data.likes[i].user_id === $localStorage.user.id) {
                                $scope.me_like = true;
                                break;
                            }
                        }
                        for (i = 0; i < data.item_id.pins.length; i++) {
                            if (data.item_id.pins[i].user_id === $localStorage.user.id) {
                                $scope.me_pin = true;
                                break;
                            }
                        }

                        var comments = data.comments;
                        for (i = 0; i < comments.length; i++) {
                            if (!comments[i].picture || comments[i].picture.length === 0)
                                comments[i].picture = 'img/favicon.png';

                            var likes = comments[i].likes;
                            if (likes && $localStorage.user.id) {
                                var found = false;
                                for (var j = 0; j < likes.length; j++) {
                                    if (likes[j] && likes[j].user_id && likes[j].user_id === $localStorage.user.id) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (found) {
                                    comments[i].can_like = 1;
                                } else {
                                    comments[i].can_like = 2;
                                }
                            } else {
                                comments[i].likes = [];
                                comments[i].can_like = 2;
                            }
                        }
                        data.comments = comments;

                        var width = $window.innerWidth - 90;
                        var c = Math.floor(width / 30);
                        $scope.show_loves_count = c;

                        $scope.item = data;
                        if (data.item_id.location && data.item_id.location.length > 0) {
                            var lat = data.item_id.location[1];
                            var lng = data.item_id.location[0];
                            data.item_id.location = {
                                lat: lat,
                                lng: lng,
                                zoom: data.item_id.zoom
                            };
                        }
                        if (data.item_id.location && data.item_id.location.lat) {
                            mapHelper.showMap(data.item_id.location, 'map-canvas_' + data.item_id._id);
                        }
                        if ($localStorage.previous && $localStorage.previous.state) {
                            var state = $localStorage.previous.state;
                            if (state === 'unFollowUser') {
                                $scope.unFollowUser(data.user_id._id);
                            } else if (state === 'followUser') {
                                $scope.followUser(data.user_id._id);
                            } else if (state === 'followList') {
                                $scope.followList();
                            } else if (state === 'unFollowList') {
                                $scope.unFollowList();
                            } else if (state === 'unlike') {
                                $scope.unlike();
                            } else if (state === 'like') {
                                $scope.like();
                            } else if (state === 'pin') {
                                $scope.pin();
                            }
                        }
                        $scope.loading = false;
                        console.log(data);
                        if (data.item_id.type === 'product') {
                            $scope.fetchLatest(data.item_id.href);
                            var unique = data.item_id.unique;
                            var website = data.item_id.website;
                            var unique_id = data.item_id._id;
                            var ajax2 = productHelper.fetchSimilar(false, unique, website);
                            ajax2.then(function (data) {
                                self.processSimliarData(data, unique_id);
                            });
                        }
                    }
                };
                self.processSimliarData = function (data, product_id) {
                    if (data.similar && data.similar.length > 0) {
                        $scope.similar = data.similar;
                        $scope.product_id = product_id;
                        console.log('initiazling iscroll');
                        if (data.similar.length > 0) {
                            $timeout(function () {
                                var width = data.similar.length * 152;
                                if (width < $window.innerWidth) {
                                    width = $window.innerWidth;
                                }
                                console.log('width ' + width);
                                console.log('product id ' + product_id);
                                angular.element(document.querySelector('.scroller_' + product_id)).attr('style', 'width:' + (width) + "px");
                            }, 100);
                        }
                        $ionicScrollDelegate.resize();
                    }
                };
                $scope.loadAllComments = function () {
                    var ajax = itemHelper.listComment($scope.list_id, $scope.item_id);
                    ajax.then(function (data) {
                        $scope.showMoreComment = true;
                        $scope.item.comments = data;
                    }, function () {
                        $scope.showMoreComment = true;
                    });
                };
                $scope.start = function () {
                    console.log('start');
                    console.log($state.params);
                    if ($state.params.item_id) {
                        var cache_key = 'item_' + $state.params.item_id + "_" + $state.params.list_id;
                        if (timeStorage.get(cache_key)) {
                            var data = timeStorage.get(cache_key);
                            $scope.checkData(data);
                        } else {
                            $ionicLoading.show({
                                template: 'Loading...'
                            });
                            $scope.clip_loading = true;
                            ajax = wishlistHelper.viewItem($state.params.item_id, $state.params.list_id);
                            ajax.then(function (data) {
                                $scope.clip_loading = false;
                                timeStorage.set(cache_key, data, 1);
                                $scope.checkData(data);
                                $ionicLoading.hide();
                            }, function () {
                                $scope.loading = false;
                                $ionicLoading.hide();
                                urlHelper.openHomePage();
                            });
                        }
                    }
                };
//                $scope.start();
                $scope.doRefresh = function () {
                    $scope.clip_loading = true;
                    var cache_key = 'item_' + $state.params.item_id + "_" + $state.params.list_id;
                    ajax = wishlistHelper.viewItem($state.params.item_id, $state.params.list_id);
                    ajax.then(function (data) {
                        $scope.clip_loading = false;
                        timeStorage.set(cache_key, data, 1);
                        $scope.checkData(data);
                        $scope.$broadcast('scroll.refreshComplete');
                    }, function () {
                        $scope.$broadcast('scroll.refreshComplete');
                    });
                };
                if (window.plugins && window.plugins.socialsharing) {
                    $scope.isMobile = true;
                    $scope.shareAll = function (product) {
                        var share_url = 'http://fashioniq.in/m/i/' + $state.params.item_id + "/" + $state.params.list_id;
                        var picture = $scope.item.item_id.img;
                        var name = $scope.item.item_id.name;
                        picture = CDN.cdnize(picture);
                        if (name.length === 0) {
                            name = 'Awesome Clip!';
                        }
                        window.plugins.socialsharing.share(name, null, picture, share_url, function () {
                        }, function () {
                            toast.showShortBottom('Unable to Share');
                        });
                    };
                    $scope.whatsapp = function (product) {
                        var share_url = 'http://fashioniq.in/m/i/' + $state.params.item_id + "/" + $state.params.list_id;
                        var picture = $scope.item.item_id.img;
                        var name = $scope.item.item_id.name;
                        if (name.length === 0) {
                            name = 'Awesome Clip!';
                        }
                        picture = CDN.cdnize(picture);
                        window.plugins.socialsharing.shareViaWhatsApp(
                                name, picture, share_url, function () {
                                }, function (e) {
                            console.log(e);
                            toast.showShortBottom('Unable to Share! App Not Found');
                        });
                    };
                    $scope.twitter = function (product) {
                        var share_url = 'http://fashioniq.in/m/i/' + $state.params.item_id + "/" + $state.params.list_id;
                        var picture = $scope.item.item_id.img;
                        var name = $scope.item.item_id.name;
                        picture = CDN.cdnize(picture);
                        if (name.length === 0) {
                            name = 'Awesome Clip!';
                        }
                        window.plugins.socialsharing.shareViaTwitter(
                                name, picture, share_url, function () {
                                }, function () {
                            toast.showShortBottom('Unable to Share! App Not Found');
                        });
                    };


                    $scope.facebook = function (product) {
                        var share_url = 'http://fashioniq.in/m/i/' + $state.params.item_id + "/" + $state.params.list_id;
                        var picture = $scope.item.item_id.img;
                        var name = $scope.item.item_id.name;
                        picture = CDN.cdnize(picture);
                        if (name.length === 0) {
                            name = 'Awesome Clip!';
                        }
                        if (window.cordova.platformId === "browser") {
                            if (!accountHelper.isFbInit()) {
                                facebookConnectPlugin.browserInit('765213543516434');
                                accountHelper.fbInit();
                            }
                        }
                        facebookConnectPlugin.showDialog({
                            method: 'share',
                            href: share_url,
                            message: name,
                            picture: picture
                        }, function (data) {
                            console.log(data);
                        }, function (data) {
                            console.log(data);
                            toast.showShortBottom('Unable to Share');
                        });
                    };
                } else {
                    $scope.isMobile = false;
                    socialJs.addSocialJs();
                }

                $scope.view = function (item) {
                    if (item.item_id.href) {
                        if (window.plugins) {
                            window.open(item.item_id.href, '_system');
                        } else {
                            window.open(item.item_id.href);
                        }
                    } else {
                        if (item.product_id)
                            urlHelper.openProductPage(item.product_id);
                    }
                };
                $scope.unFollowUser = function (user_id) {
                    if (!$localStorage.user.id) {
                        $localStorage.previous.state = {
                            function: 'unFollowUser'
                        };
                        toast.showShortBottom('SignUp/Login To UnFollow From List');
                    } else {
                        if ($scope.request_process) {
                            toast.showProgress();
                            return;
                        }
                        var cache_key = 'item_' + $state.params.item_id + "_" + $state.params.list_id;
                        $scope.request_process = true;
                        var ajax = friendHelper.user_follow(user_id, 'remove');
                        ajax.then(function (data) {
                            var followers = $scope.item.user_id.followers;
                            var new_followers = [];
                            for (var i = 0; i < followers.length; i++) {
                                if (followers[i] !== $localStorage.user.id) {
                                    new_followers.push(followers[i]);
                                }
                            }
                            $scope.item.user_id.followers = new_followers;
                            $scope.me_follow_user = false;
                            timeStorage.remove(cache_key);
                            $scope.request_process = false;
                        }, function () {
                            $scope.request_process = false;
                        });
                    }
                };

                $scope.$on('$destroy', function () {
                    $scope.modal.remove();
                });
                $scope.closeModel = function () {
                    $scope.modal.hide();
                    $scope.users = [];
                };
                $ionicModal.fromTemplateUrl('template/partial/user-follow.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal;
                });
                $scope.pinList = function () {
                    var item_id = $scope.item.item_id._id;
                    $scope.modal.show();
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    var ajax = friendHelper.item_pins_list(item_id);
                    ajax.then(function (data) {
                        if (data.length > 0) {
                            $scope.users = data;
                        } else {
                            toast.showShortBottom('No Followers Found');
                        }
                        $ionicLoading.hide();
                    }, function () {
                        $ionicLoading.hide();
                    });
                };
                $scope.unlikeComment = function (comment) {
                    var comment_id = comment._id;
                    if ($localStorage.user.id) {
                        var user_id = $localStorage.user.id;
                        var ajax = itemHelper.unlikeComment(comment_id, user_id);
                        ajax.then(function () {
                            comment.can_like = 2;
                            var likes = comment.likes;
                            if (!likes)
                                likes = [];
                            var new_likes = [];
                            for (var i = 0; i < likes.length; i++) {
                                if (likes[i].user_id !== user_id) {
                                    new_likes.push(likes[i]);
                                }
                            }

                            comment.likes = new_likes;
                        });
                    } else {
                        toast.showShortBottom('SignUp/Login To Like A Comment');
                    }
                };
                $scope.likeComment = function (comment) {
                    if ($localStorage.user.id) {
                        var user_id = $localStorage.user.id;
                        var ajax = itemHelper.likeComment(comment, user_id, $state.params.item_id, $state.params.list_id);
                        ajax.then(function () {
                            comment.can_like = 1;
                            if (!comment.likes)
                                comment.likes = [];
                            comment.likes.push({
                                user_id: user_id
                            });
                        });
                    } else {
                        toast.showShortBottom('SignUp/Login To Like A Comment');
                    }
                };
                $scope.loveList = function () {
                    //showing combined data for likes/pins
                    if (window.analytics) {
                        window.analytics.trackEvent('Love List', 'Items Page', urlHelper.getPath());
                    }
                    var loves = $scope.item.loves;
                    $scope.users = loves;
                    $scope.modal.show();
                };
                $scope.likeList = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('Like List', 'Items Page', urlHelper.getPath());
                    }
                    var list_id = $scope.item.list_id._id;
                    var item_id = $scope.item.item_id._id;
                    $scope.modal.show();
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    var ajax = friendHelper.item_likes_list(list_id, item_id);
                    ajax.then(function (data) {
                        if (data.length > 0) {
                            $scope.users = data;
                        } else {
                            toast.showShortBottom('No Followers Found');
                        }
                        $ionicLoading.hide();
                    }, function () {
                        $ionicLoading.hide();
                    });
                };
                $scope.followListList = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('Follow List', 'Items Page', urlHelper.getPath());
                    }
                    var list_id = $scope.item.list_id._id;
                    $scope.modal.show();
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    var ajax = friendHelper.list_followers_list(list_id);
                    ajax.then(function (data) {
                        if (data.length > 0) {
                            $scope.users = data;
                        } else {
                            toast.showShortBottom('No Followers Found');
                        }
                        $ionicLoading.hide();
                    }, function () {
                        $ionicLoading.hide();
                    });
                };

                $scope.followUserList = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('User Follow', 'Items Page', urlHelper.getPath());
                    }
                    var user_id = $scope.item.user_id._id;
                    $scope.modal.show();
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    var ajax = friendHelper.user_followers_list(user_id);
                    ajax.then(function (data) {
                        if (data.length > 0) {
                            $scope.users = data;
                        } else {
                            toast.showShortBottom('No Followers Found');
                        }
                        $ionicLoading.hide();
                    }, function () {
                        $ionicLoading.hide();
                    });
                };
                $scope.followUser = function (user_id, showLoading) {
                    if (window.analytics) {
                        window.analytics.trackEvent('Follow User', 'Items Page', urlHelper.getPath());
                    }
                    if (!$localStorage.user.id) {
                        $localStorage.previous.state = {
                            function: 'followUser'
                        };
                        toast.showShortBottom('SignUp/Login To Follow List');
                    } else {
                        if ($scope.request_process) {
                            toast.showProgress();
                            return;
                        }
                        if (showLoading) {
                            $ionicLoading.show({
                                template: 'Loading...'
                            });
                        }
                        var cache_key = 'item_' + $state.params.item_id + "_" + $state.params.list_id;
                        $scope.request_process = true;
                        var ajax = friendHelper.user_follow(user_id);
                        ajax.then(function (data) {
                            var followers = $scope.item.user_id.followers;
                            followers.push($localStorage.user.id);
                            $scope.item.user_id.followers = followers;
                            $scope.me_follow_user = true;
                            timeStorage.remove(cache_key);
                            $scope.request_process = false;
                            if (showLoading) {
                                $ionicLoading.hide();
                            }
                        }, function () {
                            $scope.request_process = false;
                            if (showLoading) {
                                $ionicLoading.hide();
                            }
                        });
                    }
                };
                $scope.followList = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('Follow List', 'Items Page', urlHelper.getPath());
                    }
                    if (!$localStorage.user.id) {
                        $localStorage.previous.state = {
                            function: 'followList'
                        };
                        toast.showShortBottom('SignUp/Login To Follow List');
                    } else {
                        if ($scope.request_process) {
                            toast.showProgress();
                            return;
                        }
                        var cache_key = 'item_' + $state.params.item_id + "_" + $state.params.list_id;
                        $scope.request_process = true;
                        var list_id = $scope.list_id;
                        var ajax = friendHelper.list_follow(list_id);
                        ajax.then(function (data) {
                            var followers = $scope.item.list_id.followers;
                            followers.push($localStorage.user.id);
                            $scope.item.list_id.followers = followers;
                            $scope.me_follow_list = true;
                            timeStorage.remove(cache_key);
                            $scope.request_process = false;
                        }, function () {
                            $scope.request_process = false;
                        });
                    }
                };
                $scope.unFollowList = function () {
                    if (!$localStorage.user.id) {
                        $localStorage.previous.state = {
                            function: 'unFollowList'
                        };
                        toast.showShortBottom('SignUp/Login To UnFollow From List');
                    } else {
                        if ($scope.request_process) {
                            toast.showProgress();
                            return;
                        }
                        $scope.request_process = true;
                        var list_id = $scope.list_id;
                        var cache_key = 'item_' + $state.params.item_id + "_" + $state.params.list_id;
                        var ajax = friendHelper.list_follow(list_id, 'remove');
                        ajax.then(function (data) {
                            var followers = $scope.item.list_id.followers;
                            var new_followers = [];
                            for (var i = 0; i < followers.length; i++) {
                                if (followers[i] !== $localStorage.user.id) {
                                    new_followers.push(followers[i]);
                                }
                            }
                            $scope.item.list_id.followers = new_followers;
                            $scope.me_follow_list = false;
                            timeStorage.remove(cache_key);
                            $scope.request_process = false;
                        }, function () {
                            $scope.request_process = false;
                        });
                    }
                };
                $scope.unlike = function () {
                    if (!$localStorage.user.id) {
                        $localStorage.previous.state = {
                            function: 'unlike'
                        };
                        toast.showShortBottom('Create Account To Pin Item');
                    } else {
                        if ($scope.request_process) {
                            toast.showProgress();
                            return;
                        }
                        $scope.request_process = true;
                        var item_id = $scope.item_id;
                        var list_id = $scope.list_id;
                        var ajax = itemHelper.like(item_id, list_id, 'remove');
                        var cache_key = 'item_' + $state.params.item_id + "_" + $state.params.list_id;
                        ajax.then(function (data) {
                            var likes = $scope.item.likes;
                            if (!likes) {
                                likes = [];
                            }
                            var new_likes = [];
                            for (var i = 0; i < likes.length; i++) {
                                if (likes[i].user_id !== $localStorage.user.id)
                                {
                                    new_likes.push(likes[i]);
                                }
                            }
                            $scope.me_like = false;
                            $scope.item.likes = new_likes;
                            timeStorage.remove(cache_key);
                            $scope.request_process = false;
                        }, function () {
                            $scope.request_process = false;
                        });
                    }
                };
                $scope.delete = function () {
                    $scope.request_process = true;
                    var item_id = $scope.item_id;
                    var ajax = wishlistHelper.remove(item_id, $scope.list_id);
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    ajax.finally(function () {
                        $scope.request_process = false;
                        $ionicLoading.hide();
                        var list_name = wishlistHelper.getListName($scope.list_id);
                        urlHelper.openWishlistPage($scope.list_id, list_name);
                    });
                };
                $scope.like = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('Like', 'Items Page', urlHelper.getPath());
                    }
                    if (!$localStorage.user.id) {
                        $localStorage.previous.state = {
                            function: 'like'
                        };
                        toast.showShortBottom('SignUp/Login To Like Item');
                    } else {
                        if ($scope.request_process) {
                            toast.showProgress();
                            return;
                        }
                        $scope.request_process = true;
                        var item_id = $scope.item_id;
                        var list_id = $scope.list_id;
                        var ajax = itemHelper.like(item_id, list_id);
                        var cache_key = 'item_' + $state.params.item_id + "_" + $state.params.list_id;
                        ajax.then(function (data) {
                            var likes = $scope.item.likes;
                            if (!likes) {
                                likes = [];
                            }
                            likes.push({
                                user_id: $localStorage.user.id,
                                created_at: new Date().getTime()
                            });
                            toast.showShortBottom('Item Liked');
                            $scope.me_like = true;
                            $scope.item.likes = likes;
                            timeStorage.remove(cache_key);
                            $scope.request_process = false;
                        }, function () {
                            $scope.request_process = false;
                        });
                    }
                };
                $scope.$on('wishlist_pin_select', function () {

                    $scope.request_process = false;
                    var cache_key = 'item_' + $state.params.item_id + "_" + $state.params.list_id;
                    timeStorage.remove(cache_key);
                    $scope.request_process = false;
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
                $scope.pin = function () {
                    if (window.analytics) {
                        window.analytics.trackEvent('Pin', 'Items Page', urlHelper.getPath());
                    }
                    if (!$localStorage.user.id) {
                        $localStorage.previous.state = {
                            function: 'pin'
                        };
                        toast.showShortBottom('SignUp/Login To Pin Item');
                    } else {
                        $scope.wishlist_product.product = false;
                        $scope.wishlist_product.new_item = false;
                        $scope.wishlist_product.item = $scope.item.item_id;
                        $scope.$parent.showWishlist();
                    }
                };
                $scope.buy = function (product) {
                    if (window.plugins) {
                        window.open(product.href, '_system');
                    } else {
                        window.open(product.href);
                    }
                };
                $scope.removeComment = function (comment) {
                    var ajax = itemHelper.removeComment($scope.item_id, $scope.list_id, comment._id);
                    var cache_key = 'item_' + $state.params.item_id + "_" + $state.params.list_id;
                    ajax.then(function (data) {
                        var comments = $scope.item.comments;
                        console.log(comment);
                        console.log(comments);
                        var new_comments = [];
                        for (var i = 0; i < comments.length; i++) {
                            if (comments[i]._id !== comment._id) {
                                new_comments.push(comments[i]);
                            }
                        }
                        $scope.item.comments = new_comments;
                        timeStorage.remove(cache_key);
                    });
                };
                $scope.addComment = function () {
                    if (!$localStorage.user.id) {
                        toast.showShortBottom('SignUp/Login To Post A Comment');
                        urlHelper.openSignUp();
                    } else {
                        var comment = $scope.item.comment;
                        var picture = $scope.item.picture;
                        var cache_key = 'item_' + $state.params.item_id + "_" + $state.params.list_id;
                        if (comment.length > 0) {
                            $scope.item.comment = '';
                            $scope.item.picture = '';
                            var comments = $scope.item.comments;
                            comments.unshift({
                                _id: false,
                                user_id: $localStorage.user.id,
                                comment: comment,
                                picture: $localStorage.user.picture,
                                created_at: new Date().getTime(),
                                can_like: 0
                            });
                            var ajax = itemHelper.comment($scope.item_id, $scope.list_id, comment, picture, 'add', false, $scope.item.item_id.img);
                            ajax.then(function (data) {
                                var comments = $scope.item.comments;
                                for (var i = 0; i < comments.length; i++) {
                                    if (comments[i]._id === false) {
                                        comments[i]._id = data.comment_id
                                    }
                                }
                                $scope.item.comments = comments;
                                timeStorage.remove(cache_key);
                            });
                        } else {
                            toast.showShortBottom('Comment Cannot Be Empty!');
                        }
                    }
                };


                $scope.viewList = function (list_id, list_name) {
                    urlHelper.openWishlistPage(list_id, list_name);
                };

                $scope.profile = function (user_id) {
                    if (angular.isObject(user_id)) {
                        urlHelper.openProfilePage(user_id._id, 'mine');
                    } else {
                        urlHelper.openProfilePage(user_id, 'mine');
                    }
                };
                $scope.selected_class = 'wishlist_item';
                $scope.getData = function () {
                    var defer = $q.defer();
                    var ajax = wishlistHelper.listItems($state.params.list_id, page, $scope.item_id);
                    ajax.then(function (data) {
                        var items = data.items;
                        defer.resolve(items);
                        page++;
                    }, function () {
                        defer.reject();
                    });
                    return defer.promise;
                };

                $scope.show_footer_menu = true;
                var self = this;
                self.footer_ele = false;
                $scope.scroll = function () {
                    if (!self.footer_ele) {
                        self.footer_ele = angular.element(document.getElementById('fixed_footer'));
                    }
                    var pos = $ionicPosition.offset(self.footer_ele);
                    var height = $window.innerHeight;

//                    console.log((pos.top + 50) + "XXX" + height);
                    if (pos.top + 50 > height) {
                        $scope.show_footer_menu = true;
                    } else {
                        $scope.show_footer_menu = false;
                    }
                };

                $scope.openProduct = function (product) {
                    var id = product._id;
                    console.log('open product ' + id);
                    if (!product.img) {
                        product.img = product.image;
                    }
                    dataShare.broadcastData(angular.copy(product), 'product_open');
                    urlHelper.openProductPage(id);
                };
                $scope.show_main_image_in_more = true;
                $scope.$on('image_loaded_more_images0', function () {
                    $scope.show_main_image_in_more = false;
                    $timeout(function () {
                        $ionicSlideBoxDelegate.update();
                    });
                });
                $scope.showZoom = function (index) {
                    var more_images = $scope.item.item_id.more_images;
                    var img = ajaxRequest.url('v1/picture/view/' + $scope.item.item_id.img);
                    var final_images = [];
                    final_images.push(img);
                    if (more_images) {
                        final_images = [];
                        for (var i = 0; i < more_images.length; i++) {
                            final_images.push(more_images[i]);
                        }
                    }
                    if (index * 1 === -1) {
                        $scope.zoom_main_image = img;
                    } else {
                        $scope.zoom_main_image = more_images[index * 1];
                    }
                    $scope.zoom_images = final_images;
                    $scope.zoom_height = ($window.innerHeight - 50) + "px";
                    $scope.zoom_modal.show();
                    $timeout(function () {
                        angular.element(document.querySelector('.zoom_similar')).attr('style', 'width:' + (final_images.length * 52) + "px");
                    });
                };

                $scope.$on('modal.shown', function () {
                    $rootScope.$emit('hide_android_add');
                });
                $scope.$on('modal.hidden', function () {
                    $rootScope.$emit('show_android_add');
                });

                $scope.closeZoom = function () {
                    $scope.zoom_modal.hide();
                }
                $scope.openZoomTap = function (index) {
                    var more_images = $scope.zoom_images;
                    $scope.zoom_main_image = more_images[index];
                    $ionicScrollDelegate.$getByHandle('zoom-scroll').zoomBy(1, true);
                };
                $ionicModal.fromTemplateUrl('template/partial/zoom.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.zoom_modal = modal;
                });
                $scope.$on('$destroy', function () {
                    $scope.zoom_modal.remove();
                });
                $scope.device = {
                    device: 'Desktop'
                };
                if (ionic.Platform.isWebView()) {
                    $scope.device = {
                        device: $cordovaDevice.getDevice(),
                        cordova: $cordovaDevice.getCordova(),
                        model: $cordovaDevice.getModel(),
                        platform: $cordovaDevice.getPlatform(),
                        uuid: $cordovaDevice.getUUID(),
                        version: $cordovaDevice.getVersion()
                    };
                    $cordovaAppVersion.getAppVersion().then(function (version) {
                        $scope.device.appVersion = version;
                    });
                }
                $scope.report = function () {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Abuse Report',
                        template: 'Are you sure you want to mark this item as spam/abuse?'
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            var data = {
                                item_id: $state.params.item_id,
                                list_id: $state.params.list_id,
                                user: $localStorage.user,
                                message: 'Abuse Report'
                            };
                            var ajax = ajaxRequest.send('v1/feedback/add', {
                                feedback: angular.copy(data),
                                device: angular.copy($scope.device)
                            });
                            ajax.then(function () {
                                $scope.feedback_status = 2;
                                toast.showShortBottom('Your Abuse Report Has Been Registered!');
                            }, function () {
                            });
                        } else {

                        }
                    });
                };
            }


        ]);
