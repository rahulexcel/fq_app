profileMod.controller('ProfileUpdateCtrl',
        ['$scope', '$localStorage', 'notifyHelper', '$location', '$ionicListDelegate', 'toast',
            function ($scope, $localStorage, notifyHelper, $location, $ionicListDelegate, toast) {
                $scope.$on('user_info', function () {
                    $scope.followers = $scope.$parent.user.followers;
                    if ($scope.$parent.user._id === $localStorage.user.id) {
                        $scope.me = true;
                    }
                });
                $scope.followers = $scope.$parent.user.followers;
                $scope.me = false;
                if ($scope.$parent.user._id === $localStorage.user.id) {
                    $scope.me = true;
                }
                $scope.deleteItem = function (item, index) {
                    notifyHelper.delete(item.objectId);
                    var updates = $scope.updates;
                    var new_updates = [];
                    for (var i = 0; i < updates.length; i++) {
                        if (i !== index * 1) {
                            new_updates.push(updates[i]);
                        }
                    }
                    $scope.updates = new_updates;
                    $ionicListDelegate.closeOptionButtons();
                    toast.showShortBottom('Update Deleted');
                };
                $scope.account = function (user) {
                    $location.path('/app/profile/' + user.id + '/mine');
                };
                $scope.hasMore = true;
                $scope.openUpdate = function (item) {
                    var row = item.meta;
                    if (row.type === 'add_friend') {
                        $location.path('/app/profile/me/friends');
                    } else if (row.type === 'item_unlike' || row.type === 'item_like') {
                        $location.path('/app/item/' + row.data.data.item_id._id + "/" + row.data.data.list_id._id);
                    } else if (row.type === 'follow_user') {
                        $location.path('/app/profile/' + row.user.id + '/mine');
                    } else if (row.type === 'unfollow_user') {
                        $location.path('/app/profile/' + row.user.id + '/mine');
                    } else if (row.type === 'follow_list') {
                        $location.path('/app/wishlist_item/' + row.data.list._id + "/" + row.data.list.name);
                    } else if (row.type === 'unfollow_list') {
                        $location.path('/app/wishlist_item/' + row.data.list._id + "/" + row.data.list.name);
                    } else if (row.type === 'item_comment') {
                        $location.path('/app/item/' + row.data.data.data.item_id._id + "/" + row.data.data.data.list_id._id);
                    } else if (row.type === 'item_add_user' || row.type === 'item_add') {
                        $location.path('/app/item/' + row.data.data.wishlist_model._id + "/" + row.data.data.list_id._id);
                    }
                };
                $scope.$on('friend_request', function () {
                    var index = $scope.friend_index;
                    if ($scope.updates[index]) {
                        $scope.updates[index].friend_request = true;
                    }
                    $scope.friend_index = false;
                });
                $scope.friend_index = false;
                $scope.acceptFriendRequest = function (from_user_id, index) {
                    $scope.$parent.acceptFriendRequest(from_user_id);
                    $scope.friend_index = index;
                };
                $scope.declineFriendRequest = function (from_user_id, index) {
                    $scope.$parent.declineFriendRequest(from_user_id);
                    $scope.friend_index = index;
                };

                $scope.updates = [];
                $scope.page = 0;
                var ajax = notifyHelper.getUpdate($localStorage.user.id, false, $scope.page);
                ajax.then(function (data) {
                    $scope.updateItems(data);
                });
                $scope.loadMoreUpdates = function () {
                    var ajax = notifyHelper.getUpdate($localStorage.user.id, false, $scope.page++);
                    ajax.then(function (data) {
                        $scope.updateItems(data, true);
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }, function () {
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                };
                $scope.updateItems = function (data, append) {
                    console.log(data);
                    if (data.length === 0) {
                        $scope.hasMore = false;
                    } else {
                        var updates = [];
                        if (append) {
                            updates = $scope.updates;
                        }
                        for (var i = 0; i < data.length; i++) {
                            var row = data[i];

                            var item = {};
                            if (!row.data.user) {
                                continue;
                            }
                            item.user = {
                                picture: row.data.user.picture,
                                name: row.data.user.name,
                                id: row.data.user.id
                            };
                            item.objectId = row.id;
                            if (row.type === 'item_unlike' || row.type === 'item_like') {
                                if (row.type === 'item_unlike') {
                                    item.body = {
                                        title: row.data.user.name + ' unliked your item in list ' + row.data.data.list_id.name,
                                        image: row.data.data.item_id.img
                                    };
                                } else if (row.type === 'item_like') {
                                    item.body = {
                                        title: row.data.user.name + ' likes your item in list ' + row.data.data.list_id.name,
                                        image: row.data.data.item_id.img
                                    };
                                }
                            } else if (row.type === 'follow_user') {
                                item.body = {
                                    title: row.user.name + ' is following you!'
                                };
                            } else if (row.type === 'unfollow_user') {
                                item.body = {
                                    title: row.data.name + ' stopped following you!'
                                };
                            } else if (row.type === 'follow_list') {
                                item.body = {
                                    title: row.data.user.name + ' is following your list ' + row.data.list.name
                                };
                            } else if (row.type === 'unfollow_list') {
                                item.body = {
                                    title: row.data.user.name + ' has stopped following your list ' + row.data.list.name
                                };
                            } else if (row.type === 'item_comment') {
                                if (!row.data)
                                    continue;
                                if (!row.data.data)
                                    continue;
                                if (!row.data.data.data)
                                    continue;
                                item.body = {
                                    title: item.user.name + ' commented on your item. Comment: ' + row.data.comment,
                                    image: row.data.data.data.item_id.img
                                };
                            } else if (row.type === 'item_add_user' || row.type === 'item_add') {
                                item.body = {
                                    title: 'Item added to list ' + row.data.data.list.name + ' by ' + row.data.user.name,
                                    image: row.data.data.wishlist_model.img
                                };
                            } else if (row.type === 'add_friend') {
                                item.body = {
                                    title: item.user.name + " has sent you a friend request",
                                    friend_request: false
                                };
                            } else if (row.type === 'un_friend') {
                                item.body = {
                                    title: item.user.name + " has remove you from his friend list",
                                    friend_request: false
                                };
                            }
                            item.time = row.time;
                            item.meta = row;
                            updates.push(item);
                        }
                        $scope.updates = updates;
                    }
                };
            }
        ]);