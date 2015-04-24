var wishlistnewMod = angular.module('WishlistNewMod', ['ServiceMod', 'ngStorage', 'ionic', 'WishlistService', 'FriendService', 'ItemService', 'UrlService']);

wishlistnewMod.controller('WishlistNewCtrl',
        ['$scope', '$localStorage', 'toast', 'wishlistHelper', '$ionicModal', 'friendHelper', 'timeStorage', 'itemHelper', '$stateParams', '$rootScope', 'urlHelper',
            function ($scope, $localStorage, toast, wishlistHelper, $ionicModal, friendHelper, timeStorage, itemHelper, $stateParams, $rootScope, urlHelper) {
                $scope.$on('logout_event', function () {
                    urlHelper.openSignUp();
                });
                $scope.$on('modal.shown', function () {
                    $rootScope.$emit('hide_android_add');
                });
                $scope.$on('modal.hidden', function () {
                    $rootScope.$emit('show_android_add');
                });
                var self = this;
                $scope.product = false;
                $scope.item = false;
                $scope.new_item = false;
                $scope.selected_friends = [];
                $scope.types = [
                    {text: 'Private', value: 'private'},
                    {text: 'Public', value: 'public'}
                ];
                $scope.list = {
                    type: 'public',
                    name: '',
                    description: '',
                    shared_ids: [],
                    update: false,
                    public: true,
                    private: false,
                    shared: false
                };
                $scope.friend_load = false;
                $scope.friends = [];
                if ($localStorage.user.id) {
                    var path = urlHelper.getPath();
                    if (path.indexOf('wishlist_edit') !== -1) {
                        if (!$stateParams.list_id) {
                            toast.showShortBottom('Invalid Request No List To Edit');
                            //put history in play here
                            urlHelper.openProfilePage('me', 'mine');
                        } else {

                            var list_id = $stateParams.list_id;
                            var ajax = wishlistHelper.list(true, true);
                            ajax.then(function (xlists) {
                                var list = false;
                                console.log(xlists);
                                var lists = xlists.public;
                                for (var i = 0; i < lists.length; i++) {
                                    if (lists[i]._id === list_id) {
                                        list = lists[i];
                                    }
                                }
                                if (!list) {
                                    lists = xlists.private;
                                    for (var i = 0; i < lists.length; i++) {
                                        if (lists[i]._id === list_id) {
                                            list = lists[i];
                                        }
                                    }
                                    if (!list) {
                                        lists = xlists.shared;
                                        for (var i = 0; i < lists.length; i++) {
                                            if (lists[i]._id === list_id) {
                                                list = lists[i];
                                            }
                                        }
                                    }
                                }

                                if (!list) {
                                    toast.showShortBottom('List Not Found');
                                    urlHelper.openProfilePage('me', 'mine');
                                    return;
                                }

                                if (path.indexOf('wishlist_edit') !== -1) {
                                    //check if user has access to edit list
                                    var list_user_id = list.user_id;
                                    if (angular.isObject(list.user_id)) {
                                        list_user_id = list.user_id._id;
                                    }
                                    if ($localStorage.user.id !== list_user_id) {
                                        toast.showShortBottom("You Cannot Edit This List");
                                        urlHelper.openProfilePage('me', 'mine');
                                        return;
                                    }
                                }

                                $scope.list.type = list.type;
                                $scope.list.list_id = list._id;
                                $scope.list.name = list.name;
                                $scope.list.description = list.description;
                                $scope.list.shared_ids = list.shared_ids;

                                $scope.list.update = true;
                                if (list.type === 'private') {
                                    $scope.list.public = false;
                                    $scope.list.private = true;
                                    $scope.list.shared = false;
                                } else if (list.type === 'public') {
                                    $scope.list.public = true;
                                    $scope.list.private = false;
                                    $scope.list.shared = false;
                                } else {
                                    $scope.list.public = false;
                                    $scope.list.private = false;
                                    $scope.list.shared = true;
                                }
                                var ajax = friendHelper.list();
                                ajax.then(function (data) {
                                    $scope.processFriendList(angular.copy(data));
                                }, function () {
                                    $scope.friend_load = true;
                                });
                            }, function () {
                                toast.showShortBottom('List Not Found');
                                urlHelper.openProfilePage('me', 'mine');
                                return;
                            });
                        }
                    } else {
                        var product = $scope.$parent.wishlist_product;
                        if (!product) {
                            toast.showShortBottom('Invalid Request No Product');
                            urlHelper.openHomePage();
                        } else {
                            console.log(product.product);
                            if (product.product) {
                                $scope.product = product.product;
                            } else if (product.item) {
                                $scope.item = product.item;
                            } else if (product.new_item) {
                                $scope.new_item = true;
                            } else {
                                toast.showShortBottom('Invalid Request No Product');
                                urlHelper.openHomePage();
                            }
                        }
                        var ajax = friendHelper.list();
                        ajax.then(function (data) {
                            $scope.processFriendList(angular.copy(data));
                        }, function () {
                            $scope.friend_load = true;
                        });
                    }
                } else {
                    toast.showShortBottom('You Need To Be Logged In To Access This Page');
                }

                $scope.create = function () {
                    $scope.status = 1;
                    var list_id = false;
                    if ($scope.list.type === 'shared') {
                        if ($scope.selected_friends.length === 0) {
                            toast.showShortBottom('Select Friends To Share List With');
                            return;
                        }
                    }
                    var ajax = wishlistHelper.create(angular.copy($scope.list));
                    ajax.then(function (data) {
                        timeStorage.remove('user_wish_list');
                        list_id = data.id;
                        if ($scope.product) {
                            if ($scope.product._id) {
                                var ajax2 = wishlistHelper.add($scope.product._id, list_id);
                                ajax2.then(function () {
                                    $scope.status = 2;
                                    toast.showShortBottom('Product Added To Your Wishlist');
                                    urlHelper.openWishlistPage(list_id, list.name);
                                }, function (message) {
                                    toast.showShortBottom(message);
                                    $scope.status = 2;
                                });
                            } else {
                                if ($scope.$parent.show_wishlist_type) {
                                    urlHelper.openWishlistAddStep2($scope.$parent.show_wishlist_type, list_id);
                                } else {
                                    urlHelper.openWishlistAddStep1();
                                }
                            }
                        } else if ($scope.item) {
                            if ($scope.item.item_id._id) {
                                var ajax = itemHelper.pin($scope.item.item_id._id, list_id);
                                ajax.then(function (data) {
                                    $scope.status = 2;
                                    toast.showShortBottom('Product Added To Your Wishlist');
                                    urlHelper.openWishlistPage(list_id, $scope.list.name);
                                }, function (message) {
//                                        toast.showShortBottom(message);
                                    $scope.status = 2;
                                });
                            } else {
                                if ($scope.$parent.show_wishlist_type) {
                                    urlHelper.openWishlistAddStep2($scope.$parent.show_wishlist_type, list_id);
                                } else {
                                    urlHelper.openWishlistAddStep1();
                                }
                            }
                        } else if ($scope.new_item) {
                            if ($scope.$parent.show_wishlist_type) {
                                urlHelper.openWishlistAddStep2($scope.$parent.show_wishlist_type, list_id);
                            } else {
                                urlHelper.openWishlistAddStep1();
                            }
                        } else {
                            urlHelper.openProfilePage('me', 'mine');
                        }
                    }, function (data) {
                        $scope.status = 3;
                    });
                };

                $scope.checkType = function (type) {
                    if (type === 'shared') {
                        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                            cordova.plugins.Keyboard.close();
                        }
//                            $scope.list.type = 'private';
                        if ($scope.friends && $scope.friends.length > 0) {
                            $scope.modal.show();
                        } else {
                            toast.showShortBottom('Add Friends To Share List With Them!');
                            return;
                        }
                    } else {
                        $scope.selected_friends = [];
                    }
                    if (type === 'public') {
                        $scope.list.type = 'public';
                        $scope.list.public = true;
                        $scope.list.private = false;
                        $scope.list.shared = false;
                        var friends = $scope.friends;
                        if (!friends) {
                            friends = [];
                        }
                        for (var i = 0; i < friends.length; i++) {
                            friends[i].checked = false;
                        }
                        $scope.friends = friends;
                    } else if (type === 'private') {
                        $scope.list.type = 'private';
                        $scope.list.public = false;
                        $scope.list.private = true;
                        $scope.list.shared = false;
                        var friends = $scope.friends;
                        if (!friends) {
                            friends = [];
                        }
                        for (var i = 0; i < friends.length; i++) {
                            friends[i].checked = false;
                        }
                        $scope.friends = friends;
                    } else {
                        $scope.list.type = 'shared';
                        $scope.list.public = false;
                        $scope.list.private = false;
                        $scope.list.shared = true;
                    }
                };

                $scope.refreshFriendList = function () {
                    var ajax = friendHelper.list(false, true);
                    ajax.then(function (data) {
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.processFriendList(angular.copy(data));
                    }, function () {
                        $scope.$broadcast('scroll.refreshComplete');
                    });
                };
                $scope.processFriendList = function (data) {

                    var shared_ids = $scope.list.shared_ids;
                    for (var i = 0; i < shared_ids.length; i++) {
                        for (var j = 0; j < data.length; j++) {
                            console.log(shared_ids[i] + "====" + data[j].id);
                            if (shared_ids[i] === data[j].id) {
                                data[j].checked = true;
                                $scope.selected_friends.push(data[j]);
                                break;
                            }
                        }
                    }
                    $scope.friends = data;
                    $scope.friend_load = true;
                };

                $scope.selectFriend = function (friend) {
                    if (friend) {
                        var id = friend.id;
                        if (!friend.checked) {
                            friend.checked = true;
                            if (id === -1) {
                                var friends = $scope.friends;
                                for (var i = 0; i < friends.length; i++) {
                                    if (i === 0) {
                                        continue;
                                    } else {
                                        friends[i].checked = false;
                                    }
                                }
                                $scope.friends = friends;
                                $scope.list.shared_ids = [];
//                                    $scope.modal.hide();
                            } else {
//                                    $scope.friends[0].checked = false; //remove only me
                                var shared_ids = $scope.list.shared_ids;
                                if (shared_ids.indexOf(id) === -1) {
                                    shared_ids.push(id);
                                }
                                $scope.list.shared_ids = shared_ids;
                                $scope.selected_friends = [];
                                var friends = $scope.friends;
                                for (var i = 0; i < shared_ids.length; i++) {
                                    for (var j = 0; j < friends.length; j++) {
                                        if (shared_ids[i] === friends[j].id) {
                                            $scope.selected_friends.push(friends[j]);
                                            break;
                                        }
                                    }

                                }
                                console.log($scope.selected_friends);
                            }
                        } else {
                            friend.checked = false;
                            if (id !== -1) {
                                var shared_ids = $scope.list.shared_ids;
                                var new_shared_ids = [];
                                for (var i = 0; i < shared_ids.length; i++) {
                                    if (shared_ids[i] === id) {
                                        new_shared_ids.push(id);
                                    }
                                }
                                $scope.list.shared_ids = new_shared_ids;
                                $scope.selected_friends = [];
                                var friends = $scope.friends;
                                for (var i = 0; i < new_shared_ids.length; i++) {
                                    for (var j = 0; j < friends.length; j++) {
                                        if (new_shared_ids[i] === friends[j.id]) {
                                            $scope.selected_friends.push(friends[j]);
                                            break;
                                        }
                                    }

                                }
                            }
                        }
                    } else {
                        $scope.list.shared_ids = [];
                        $scope.modal.hide();
                    }
                };


                $scope.$on('$destroy', function () {
                    $scope.modal.remove();
                });
                $scope.closeModel = function () {
                    $scope.modal.hide();
                };
                $ionicModal.fromTemplateUrl('template/partial/friend-select.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal;
                });
            }
        ]);