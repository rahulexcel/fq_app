profileMod.controller('ProfileFollowerCtrl',
        ['$scope', '$localStorage', 'toast', 'wishlistHelper', '$location', 'dataShare',
            function ($scope, $localStorage, toast, wishlistHelper, $location, dataShare) {
                $scope.$on('user_info', function () {
                    $scope.followers = $scope.$parent.user.followers;
                })
                $scope.followers = $scope.$parent.user.followers;
                $scope.me = false;
                if ($scope.$parent.user._id == $localStorage.user.id) {
                    $scope.me = true;
                }
            }
        ]);