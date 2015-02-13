profileMod.controller('ProfileUpdateCtrl',
        ['$scope', '$localStorage', 'toast', 'notifyHelper', '$location',
            function ($scope, $localStorage, toast, notifyHelper, $location) {
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
                $scope.deleteItem = function (item, $index) {
                    notifyHelper.delete(item.objectId);
                    var updates = $scope.updates;
                    delete updates[$index];
                    $scope.updates = updates;
                };
                $scope.account = function (user) {
                    $location.path('/app/profile/' + user.id + '/mine');
                };
                $scope.hasMore = true;
                $scope.openUpdate = function (item) {
                    var row = row.meta;
                    if (row.type === 'item_unlike' || row.type === 'item_like') {
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
                }
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
                                        title: row.data.user.name + ' liked your item in list ' + row.data.data.list_id.name,
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
                                    title: 'Comment: ' + row.data.comment,
                                    image: row.data.data.data.item_id.img
                                };
                            } else if (row.type === 'item_add_user' || row.type === 'item_add') {
                                item.body = {
                                    title: 'Item added to list ' + row.data.data.list.name + ' by ' + row.data.user.name,
                                    image: row.data.data.wishlist_model.img
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