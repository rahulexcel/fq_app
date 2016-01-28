profileMod.controller('ProfileUpdateCtrl',
        ['$scope', '$localStorage', 'notifyHelper', '$ionicListDelegate', 'toast', 'notifyHelper',
            function ($scope, $localStorage, notifyHelper, $ionicListDelegate, toast, notifyHelper) {
                $scope.$on('doRefresh', function () {
                    $scope.doRefresh();
                });
                $scope.$on('user_info', function () {
                    $scope.followers = $scope.$parent.user.followers;
                    if ($scope.$parent.user._id === $localStorage.user.id) {
                        $scope.me = true;
                    }
                });
                $scope.loading = false;
                $scope.followers = $scope.$parent.user.followers;
                $scope.me = false;
                if ($scope.$parent.user._id === $localStorage.user.id) {
                    $scope.me = true;
                }
                $scope.deleteItem = function (item, index) {
                    notifyHelper.delete(item.objectId);
                    var updates = $scope.updates;
                    var new_updates = [];
                    console.log(index);
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
                    urlHelper.openProfilePage(user.id, 'mine');
                };
                $scope.hasMore = true;
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
                $scope.doRefresh = function () {
                    $scope.page = 0;
                    $scope.getItems($scope.page);
                };
                $scope.updates = [];
                $scope.page = 0;
                $scope.getItems = function () {
                    $scope.loading = true;
                    var ajax = notifyHelper.getUpdate($localStorage.user.id, false, $scope.page);
                    ajax.then(function (data) {
                        $scope.loading = false;
                        $scope.updateItems(data);
                    });
                };
                $scope.getItems(0);
                $scope.doRefresh = function () {
                    $scope.page = 0;
                    $scope.loadMoreUpdates(0);
                };
                $scope.loadMoreUpdates = function () {
                    $scope.page++;
                    var ajax = notifyHelper.getUpdate($localStorage.user.id, false, $scope.page);
                    ajax.then(function (data) {
                        $scope.updateItems(data, true);
                        $scope.$emit('scroll.refreshComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }, function () {
                        $scope.$emit('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                    });
                };
                $scope.openUpdate = function (item) {
                    var row = item.meta;
                    notifyHelper.openItem(row);
                };
                $scope.updateItems = function (data, append) {
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
                            if (row.type === 'price_alert') {
                                row.data.user = $localStorage.user;
                            }
                            if (!row.data.user) {
                                continue;
                            }
                            item.user = {
                                picture: row.data.user.picture,
                                name: row.data.user.name,
                                id: row.data.user.id
                            };
                            item.objectId = row.id;
                            if (row.type === 'like_comment') {
                                item.body = {
                                    title: item.user.name + ' likes your comment : ' + row.data.comment
                                };
                            } else if (row.type === 'price_alert') {
                                item.body = {
                                    title: 'Price Changed for ' + row.data.name + ' from Rs.' + row.data.price + " to Rs." + row.data.price_found,
                                    image: row.data.img
                                };
                            } else if (row.type === 'pic_update') {
                                item.body = {
                                    title: row.data.user.name + ' updated profile picture'
                                };
                            } else if (row.type === 'status_update') {
                                item.body = {
                                    title: row.data.user.name + ' updated status : ' + row.status,
                                };
                            } else if (row.type === 'item_unlike' || row.type === 'item_like') {
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
                            } else if (row.type === 'list_created') {
                                item.body = {
                                    title: row.data.user.name + ' has shared a list with you!'
                                };
                            } else if (row.type === 'follow_user') {
                                item.body = {
                                    title: row.data.user.name + ' is following you!'
                                };
                            } else if (row.type === 'unfollow_user') {
                                item.body = {
                                    title: row.data.user.name + ' stopped following you!'
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
                            } else if (row.type === 'list_left') {
                                item.body = {
                                    title: item.user.name + " has left your list " + item.list.name
                                };
                            } else if (row.type === 'add_friend') {
                                item.body = {
                                    title: item.user.name + " has sent you a friend request",
                                    friend_request: true
                                };
                            } else if (row.type === 'accept_friend') {
                                item.body = {
                                    title: item.user.name + " has accepted your friend request",
                                };
                            } else if (row.type === 'decline_friend') {
                                item.body = {
                                    title: item.user.name + " has declined your friend request",
                                };
                            } else if (row.type === 'un_friend') {
                                item.body = {
                                    title: item.user.name + " has remove you from his friend list",
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