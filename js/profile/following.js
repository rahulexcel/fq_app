profileMod.controller('ProfileFollowingCtrl',
        ['$scope', '$localStorage', 'toast', 'friendHelper', '$location', 'dataShare',
            function ($scope, $localStorage, toast, friendHelper, $location, dataShare) {
                $scope.$on('user_info', function () {
                    $scope.following_users = $scope.$parent.user.following;
                    $scope.lists_their = $scope.$parent.user.lists_their;
                })
                $scope.following_users = $scope.$parent.user.following;
                $scope.lists_their = $scope.$parent.user.lists_their;
                $scope.me = false;
                if ($scope.$parent.user._id === $localStorage.user.id) {
                    $scope.me = true;
                }


                $scope.request_process = false;
                $scope.viewList = function (list) {
                    var list_id = list._id;
                    console.log('/app/wishlist_item/' + list_id + "/" + list.name);
                    $location.path('/app/wishlist_item/' + list_id + "/" + list.name);
                };
                $scope.unFollowList = function (list_id, index) {
                    if ($scope.request_process) {
                        toast.showProgress();
                        return;
                    }
                    $scope.request_process = true;
                    var ajax = friendHelper.list_follow(list_id, 'remove');
                    ajax.then(function (data) {
                        var lists = $scope.lists_their;
                        lists.splice(index, 1);
                        $scope.lists_their = lists;
                        $scope.request_process = false;
                    }, function () {
                        $scope.request_process = false;
                    });
                };
                $scope.unFollowUser = function (user_id, index) {
                    if ($scope.request_process) {
                        toast.showProgress();
                        return;
                    }
                    $scope.request_process = true;
                    var ajax = friendHelper.user_follow(user_id, 'remove');
                    ajax.then(function () {
                        var users = $scope.following_users;
                        users.splice(index, 1);
                        $scope.following_users = users;

                        $scope.request_process = false;
                    }, function () {
                        $scope.request_process = false;
                    });
                };
            }
        ]);