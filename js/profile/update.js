profileMod.controller('ProfileUpdateCtrl',
        ['$scope', '$localStorage', 'toast', 'notifyHelper',
            function ($scope, $localStorage, toast, notifyHelper) {
                $scope.$on('user_info', function () {
                    $scope.followers = $scope.$parent.user.followers;
                })
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
                $scope.updates = [];
                var ajax = notifyHelper.getUpdate($localStorage.user.id, false, 0);
                ajax.then(function (data) {
                    console.log(data);
                    var updates = [];
                    for (var i = 0; i < data.length; i++) {
                        var row = data[i];

                        var item = {};
                        if (!row.data.user) {
                            continue;
                        }
                        item.user = {
                            picture: row.data.user.id,
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
                        }
                        item.time = row.time;
                        updates.push(item);
                    }
                    $scope.updates = updates;
                });
            }
        ]);