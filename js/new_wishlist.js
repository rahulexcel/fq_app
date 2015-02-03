var wishlistnewMod = angular.module('WishlistNewMod', ['ServiceMod', 'ngStorage', 'ionic', 'WishlistService', 'FriendService', 'ItemService']);

wishlistnewMod.controller('WishlistNewCtrl',
        ['$scope', '$localStorage', 'toast', 'wishlistHelper', 'dataShare', '$location', '$ionicModal', 'friendHelper', 'timeStorage', 'itemHelper',
            function ($scope, $localStorage, toast, wishlistHelper, dataShare, $location, $ionicModal, friendHelper, timeStorage, itemHelper) {
                if ($localStorage.user.id) {
                    $scope.product = false;
                    $scope.item = false;
                    $scope.new_item = false;

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
                        checked: false
                    };
                    var path = $location.path();
                    if (path.indexOf('wishlist_edit') !== -1) {
                        var list = dataShare.getData();
                        if (!list) {
                            toast.showShortBottom('Invalid Request No List To Edit');
                            //put history in play here
                            $location.path('/app/profile/me/mine');
                        } else {
                            $scope.list.type = list.type;
                            $scope.list.list_id = list._id;
                            $scope.list.name = list.name;
                            $scope.list.description = list.description;
                            $scope.list.shared_ids = list.shared_ids;
                            $scope.list.update = true;
                            if (list.type === 'private') {
                                $scope.list.checked = true;
                            } else {
                                $scope.list.checked = false;
                            }
                        }
                    } else {
                        var product = dataShare.getData();
                        if (!product) {
                            toast.showShortBottom('Invalid Request No Product');
                            //put history in play here
                            $location.path('/app/home');
                        } else {
                            console.log(product.product);
                            if (product.product) {
                                $scope.product = product.product;
                            } else if (product.item) {
                                $scope.item = product.item;
                            } else if (product.new_item) {
                                $scope.new_item = true;
                            }
                        }
                    }

                    $scope.create = function () {
                        $scope.status = 1;
                        var list_id = false;
                        var ajax = wishlistHelper.create(angular.copy($scope.list));
                        ajax.then(function (data) {
                            timeStorage.remove('user_wish_list');
                            if ($scope.product) {
                                list_id = data.id;
                                if ($scope.product._id) {
                                    var ajax2 = wishlistHelper.add($scope.product._id, list_id);
                                    ajax2.then(function () {
                                        $scope.status = 2;
                                        toast.showShortBottom('Product Added To Your Wishlist');
                                        $location.path('/app/wishlist_item/' + list_id + "/" + list_id + "/" + $scope.list.name);
                                    }, function (message) {
                                        toast.showShortBottom(message);
                                        $scope.status = 2;
                                    });
                                } else {
                                    $location.path('/app/wishlist_item_add/' + list_id + "/step1");
                                }
                            } else if ($scope.item) {
                                list_id = data.id;
                                if ($scope.item.item_id._id) {
                                    var ajax = itemHelper.pin($scope.item.item_id._id, list_id);
                                    ajax.then(function (data) {
                                        $scope.status = 2;
                                        toast.showShortBottom('Product Added To Your Wishlist');
                                        $location.path('/app/wishlist_item/' + list_id + "/" + list_id + "/" + $scope.list.name);
                                    }, function (message) {
                                        toast.showShortBottom(message);
                                        $scope.status = 2;
                                    });
                                } else {
                                    $location.path('/app/wishlist_item_add/' + list_id + "/step1");
                                }
                            } else if ($scope.new_item) {
                                $location.path('/app/wishlist_item_add/' + list_id + "/step1");
                            } else {
                                $location.path('/app/profile/me/mine');
                            }
                        }, function (data) {
                            toast.showShortBottom(data);
                            $scope.status = 3;
                        });
                    };

                    $scope.checkType = function () {
                        if (!$scope.list.checked) {
                            $scope.list.type = 'public';
                        } else {
                            $scope.list.type = 'private';
                            if ($scope.friends && $scope.friends.length > 0)
                                $scope.modal.show();
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
                    $scope.friend_load = false;
                    $scope.friends = [{
                            id: -1,
                            name: 'Only Me'
                        }];
                    var ajax = friendHelper.list();
                    ajax.then(function (data) {
                        $scope.processFriendList(angular.copy(data));
                    }, function () {
                        $scope.friend_load = true;
                    });
                    $scope.processFriendList = function (data) {
                        console.log('herer');
                        console.log(data);

                        data.unshift({
                            id: -1,
                            name: 'Only Me'
                        });
                        var shared_ids = $scope.list.shared_ids;
                        for (var i = 0; i < shared_ids.length; i++) {
                            for (var j = 0; j < data.length; j++) {
                                if (shared_ids[i] === data[j].id) {
                                    data[j].checked = true;
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
                                $scope.modal.hide();
                            } else {
                                $scope.friends[0].checked = false;
                                var shared_ids = $scope.list.shared_ids;
                                if (shared_ids.indexOf(id) === -1) {
                                    shared_ids.push(id);
                                }
                                $scope.list.shared_ids = shared_ids;
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
                        if ($scope.list.shared_ids.length > 0) {
                            $scope.list.type = 'public';
                            $scope.list.checked = false;
                        }
                        $scope.modal.hide();
                    };
                    $ionicModal.fromTemplateUrl('template/partial/friend-select.html', {
                        scope: $scope,
                        animation: 'slide-in-up'
                    }).then(function (modal) {
                        $scope.modal = modal;
                    });
                } else {
                    toast.showShortBottom('You Need To Be Logged In To Access This Page');
                }


            }
        ]);