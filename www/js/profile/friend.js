profileMod.controller('ProfileFriendCtrl',
        ['$scope', '$localStorage', 'friendHelper',
            function ($scope, $localStorage, friendHelper) {
                $scope.$on('doRefresh', function () {
                    $scope.doRefresh();
                });
                var i = 0;
                $scope.$on('user_info', function () {
                    var friends = $scope.$parent.user.friends;
                    if (friends) {
                        for (i = 0; i < friends.length; i++) {
                            friends[i].is_friend = true;
                        }
                    }
                    $scope.friends = friends;
                    var friend_requests = $scope.$parent.friend_requests;
                    if (friend_requests) {
                        for (i = 0; i < friend_requests.length; i++) {
                            friend_requests[i].is_request = true;
                        }
                    }
                    $scope.friend_requests = friend_requests;
                    if ($scope.$parent.user._id === $localStorage.user.id) {
                        $scope.me = true;
                    }
                });
                var friends = $scope.$parent.user.friends;
                if (friends) {
                    for (i = 0; i < friends.length; i++) {
                        friends[i].is_friend = true;
                    }
                }
                $scope.friends = friends;

                var friend_requests = $scope.$parent.friend_requests;
                if (friend_requests) {
                    for (i = 0; i < friend_requests.length; i++) {
                        friend_requests[i].is_request = true;
                    }
                }
                $scope.friend_requests = friend_requests;
                $scope.me = false;
                if ($scope.$parent.user._id === $localStorage.user.id) {
                    $scope.me = true;
                }

                $scope.doRefresh = function () {
                    $scope.hasMore = true;
                    $scope.page = -1;
                    $scope.loadMoreFriends();
                };

                $scope.hasMore = true;
                $scope.page = -1;
                $scope.loadMoreFriends = function () {
                    $scope.page = $scope.page + 1;
                    var ajax = friendHelper.loadMoreFriends($scope.$parent.user._id, $scope.page);
                    ajax.then(function (data) {
                        if (data.length > 0) {
                            for (var i = 0; i < data.length; i++) {
                                $scope.friends.push(data[i]);
                            }
                        } else {
                            $scope.hasMore = false;
                        }
                        $scope.$emit('scroll.refreshComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }, function () {
                        $scope.hasMore = false;
                        $scope.$emit('scroll.refreshComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                };
                $scope.profile = function (user_id) {
                    urlHelper.openProfilePage(user_id, 'mine');
                };

                $scope.$on('friend_request', function () {
                    var index = $scope.friend_index * 1;
                    var friend_requests = $scope.friend_requests;
                    var new_friend_requests = [];
                    for (i = 0; i < friend_requests.length; i++) {
                        if (i !== index) {
                            new_friend_requests.push(friend_requests[i]);
                        }
                    }
                    $scope.friend_requests = new_friend_requests;
                    $scope.friend_index = false;
                });
                $scope.$on('unfriend', function () {
                    var index = $scope.friend_index * 1;
                    var friends = $scope.friends;
                    var new_friend_requests = [];
                    for (var i = 0; i < friend_requests.length; i++) {
                        if (i !== index) {
                            new_friend_requests.push(friend_requests[i]);
                        }
                    }
                    $scope.friends = friends;
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
            }
        ]);