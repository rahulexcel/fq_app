var wishlistItemMod = angular.module('WishlistItemMod', ['ServiceMod', 'ngStorage', 'ionic', 'WishlistService', 'MapService', 'ItemService', 'FriendService']);
wishlistItemMod.controller('WishlistItemCtrl',
        ['$scope', '$localStorage', 'toast', 'wishlistHelper', '$location', '$stateParams', 'mapHelper', '$window', 'socialJs', 'itemHelper', 'friendHelper', 'timeStorage', '$ionicLoading', '$ionicModal',
            function ($scope, $localStorage, toast, wishlistHelper, $location, $stateParams, mapHelper, $window, socialJs, itemHelper, friendHelper, timeStorage, $ionicLoading, $ionicModal) {
                $scope.wishlist = [];
                $scope.loading = true;
                $scope.items = [];
                var ajax = false;
                $scope.$on('$destroy', function () {
                    mapHelper.destroy();
                });
                $scope.$on('logout_event', function () {
                    $scope.me_pin = false;
                    $scope.me_like = false;
                    $scope.me_follow_user = false;
                    $scope.me_follow_list = false;
                });
                var picture_width = $window.innerWidth;
                picture_width = Math.ceil(picture_width * 0.95);
                $scope.picture_width = picture_width;
                $scope.mine = false;
                if ($stateParams.item_id) {
                    $scope.item_id = $stateParams.item_id;
                    $scope.list_id = $stateParams.list_id;
                    $scope.me_pin = false;
                    $scope.me_like = false;
                    $scope.me_follow_user = false;
                    $scope.me_follow_list = false;
                    $scope.checkData = function (data) {

                        if ($localStorage.user.id)
                            if (data.list_id.user_id === $localStorage.user.id) {
                                $scope.mine = true;
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
                        console.log(data);
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
                        }

                        $scope.item = data;
                        if (data.location && data.location.lat) {
                            mapHelper.showMap(data.location);
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

                    var cache_key = 'item_' + $stateParams.item_id + "_" + $stateParams.list_id;
                    if (timeStorage.get(cache_key)) {
                        var data = timeStorage.get(cache_key);
                        $scope.checkData(data);
                    } else {
                        $ionicLoading.show({
                            template: 'Loading...'
                        });
                        ajax = wishlistHelper.viewItem($stateParams.item_id, $stateParams.list_id);
                        ajax.then(function (data) {
                            timeStorage.set(cache_key, data, 1);
                            $scope.checkData(data);
                            $ionicLoading.hide();
                        }, function () {
                            $scope.loading = false;
                            $ionicLoading.hide();
                            $location.path('/app/home/trending');
                        });
                    }
                    $scope.doRefresh = function () {
                        ajax = wishlistHelper.viewItem($stateParams.item_id, $stateParams.list_id);
                        ajax.then(function (data) {
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
                            window.plugins.socialsharing.share(product.name, null, product.picture, product.href, function () {
                            }, function () {
                                toast.showShortBottom('Unable to Share');
                            });
                        };
                        $scope.twitter = function (product) {
                            window.plugins.socialsharing.shareViaTwitter(
                                    product.name, product.picture, product.href, function () {
                                    }, function () {
                                toast.showShortBottom('Unable to Share');
                            });
                        };
                        $scope.whatsapp = function (product) {
                            window.plugins.socialsharing.shareViaWhatsApp(
                                    product.name, product.picture, product.href, function () {
                                    }, function () {
                                toast.showShortBottom('Unable to Share');
                            });
                        };

                        $scope.facebook = function (product) {
                            if (window.cordova.platformId === "browser") {
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
                            });
                        };
                    } else {
                        $scope.isMobile = false;
                        socialJs.addSocialJs();
                    }

                    $scope.view = function (item) {
                        if (item.product_id)
                            $location.path('/app/product/' + item.product_id);
                    };
                    $scope.request_process = false;
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
                    $scope.likeList = function () {
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
                            $location.path('/app/home/trending');
                        });
                    };
                    $scope.like = function () {
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
                                timeStorage.remove(cache_key);
                                $scope.request_process = false;
                            }, function () {
                                $scope.request_process = false;
                            });
                        }
                    };
                    $scope.$on('wishlist_pin_select', function () {
                        var list_id = $scope.wishlist_product.item.select_list_id;
                        var ajax = itemHelper.pin($scope.item.item_id._id, list_id);
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
                            timeStorage.remove(cache_key);
                            $scope.request_process = false;
                        }, function () {
                            $scope.request_process = false;
                        });
                    });
                    $scope.pin = function () {
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

                }
                $scope.buy = function (product) {
                    if (window.plugins) {
                        window.open(product.href, '_system');
                    } else {
                        window.open(product.href);
                    }
                };
                $scope.addComment = function () {
                    if (!$localStorage.user.id) {
                        toast.showShortBottom('SignUp/Login To Post A Comment');
                        $location.app('/app/signup');
                    } else {
                        var comment = $scope.item.comment;
                        var picture = $scope.item.picture;
                        var ajax = itemHelper.comment($scope.item_id, $scope.list_id, comment, picture);
                        ajax.then(function (data) {
                            var comments = $scope.item.comments;
                            comments.unshift({
                                _id: -1,
                                user_id: $localStorage.user.id,
                                comment: $scope.item.comment,
                                picture: $localStorage.user.picture,
                                created_at: new Date().getTime()
                            });
                            $scope.item.comments = comments;
                            $scope.item.comment = '';
                            $scope.item.picture = '';
                            timeStorage.remove(cache_key);
                        });
                    }
                };

//                    $scope.is_mobile = false;
//                    if (window.cordova && window.cordova.plugins) {
//                        $scope.is_mobile = true;
//                    }
//                    $scope.file_upload = false;
//                    $scope.file = {
//                        myFiles: false
//                    };
//                    $scope.browseCamera = function () {
//                        $ionicActionSheet.show({
//                            buttons: [
//                                {text: 'Brower Pictures'},
//                                {text: 'Take Picture'}
//                            ],
//                            titleText: 'Upload Pic',
//                            cancelText: 'Cancel',
//                            buttonClicked: function (index) {
//
//                                var options = {
//                                    quality: 100,
//                                    destinationType: Camera.DestinationType.FILE_URI,
//                                    sourceType: Camera.PictureSourceType.CAMERA,
//                                    encodingType: Camera.EncodingType.JPEG,
//                                    popoverOptions: CameraPopoverOptions,
//                                    saveToPhotoAlbum: false,
//                                    allowEdit: false,
//                                    cameraDirection: Camera.Direction.FRONT
//                                };
//                                if (index == 0) {
//                                    options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
//                                }
//
//                                $cordovaCamera.getPicture(options).then(function (imageURI) {
//                                    console.log(imageURI);
//                                    $scope.progoress_style = {width: '0%'};
//                                    $scope.progress = 0;
//                                    $scope.file_upload = false;
//                                    var promise = uploader.fileSize(imageURI);
//                                    promise.then(function (size) {
//                                        console.log('size is ' + size);
//                                        $scope.image_size = size * 1;
//                                        if (size * 1 > 5) {
//                                            toast.showShortBottom('Upload File Of Size Less Than 5MB');
//                                        } else {
//                                            $scope.file_upload = true;
//                                            var ajax = uploader.upload(imageURI, {
//                                                user_id: $localStorage.user.id
//                                            });
//                                            ajax.then(function (data) {
//                                                var per = '100%';
//                                                $scope.progoress_style = {width: per};
//                                                $scope.progress = per;
//                                                console.log(data);
//                                                var pic = ajaxRequest.url('v1/picture/view/' + data.data);
//                                                $scope.item.picture = pic;
//                                                $scope.file_upload = false;
//                                            }, function (data) {
//
//                                            }, function (data) {
//                                                var per = data.progress + '%';
//                                                $scope.progoress_style = {width: per};
//                                                $scope.progress = per;
//                                            });
//                                        }
//                                    });
//                                }, function (err) {
//                                });
//                                return true;
//                            }
//                        });
//                    }
//
//                    $scope.$watch('file.myFiles', function (val) {
//                        if (!val) {
//                            return;
//                        }
//                        for (var i = 0; i < $scope.file.myFiles.length; i++) {
//                            var file = $scope.file.myFiles[i];
//                            var size = file.size;
//                            var mb_size = Math.ceil((size / (1024 * 1024)));
//                            if (mb_size > 5) {
//                                $scope.file = {
//                                    myFiles: false
//                                };
//                                toast.showShortBottom('Upload File Of Size Less Than 2MB');
//                                return;
//                            }
//
//                            $scope.file_upload = true;
//                            $scope.upload = $upload.upload({
//                                url: ajaxRequest.url('v1/picture/upload'),
//                                data: {user_id: $localStorage.user.id},
//                                file: file
//                            }).progress(function (evt) {
//                                var per = parseInt(100.0 * evt.loaded / evt.total) + '%';
//                                $scope.progoress_style = {width: per};
//                                $scope.progress = per;
//                            }).success(function (data, status, headers, config) {
//                                var per = '100%';
//                                $scope.progoress_style = {width: per};
//                                $scope.progress = per;
//                                console.log(data);
//                                if (data.data) {
//                                    var pic = ajaxRequest.url('v1/picture/view/' + data.data);
//                                    $scope.item.picture = pic;
//                                    $scope.file_upload = false;
//                                }
//                            });
//                        }
//                    });
            }
        ]);