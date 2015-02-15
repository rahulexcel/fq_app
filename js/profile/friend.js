profileMod.controller('ProfileFriendCtrl',
        ['$scope', '$localStorage', 'toast', '$location', 'friendHelper',
            function ($scope, $localStorage, toast, $location, friendHelper) {
                $scope.$on('user_info', function () {
                    $scope.friends = $scope.$parent.user.friends;
                    $scope.friend_requests = $scope.$parent.friend_requests;
                    if ($scope.$parent.user._id === $localStorage.user.id) {
                        $scope.me = true;
                    }
                });
                $scope.friends = $scope.$parent.user.friends;
                $scope.friend_requests = $scope.$parent.friend_requests;
                $scope.me = false;
                if ($scope.$parent.user._id === $localStorage.user.id) {
                    $scope.me = true;
                }

                $scope.hasMore = true;
                $scope.page = 0;
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
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }, function () {
                        $scope.hasMore = false;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                };
                $scope.profile = function (user_id) {
                    $location.path('/app/profile/' + user_id + '/mine');
                };

                $scope.$on('friend_request', function () {
                    var index = $scope.friend_index * 1;
                    var friend_requests = $scope.friend_requests;
                    var new_friend_requests = [];
                    for (var i = 0; i < friend_requests.length; i++) {
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
                $scope.unFriend = function (friend_id, index) {
                    $scope.$parent.unFriend(friend_id);
                    $scope.friend_index = index;
                };
            }
        ]);