profileMod.controller('ProfileFollowerCtrl',
        ['$scope', '$localStorage', 'toast', 'friendHelper', '$location', 'dataShare',
            function ($scope, $localStorage, toast, friendHelper, $location, dataShare) {
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

                $scope.followUser = function (user_id, index) {
                    if ($scope.request_process) {
                        toast.showProgress();
                        return;
                    }
                    $scope.request_process = true;
                    var ajax = friendHelper.user_follow(user_id);
                    ajax.then(function () {
                        toast.showShortBottom('You Are Now Following ' + $scope.followers[index].name);
                        $scope.request_process = false;
                    }, function () {
                        $scope.request_process = false;
                    });
                };
            }
        ]);