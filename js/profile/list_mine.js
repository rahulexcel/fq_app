profileMod.controller('ProfileListMineCtrl',
        ['$scope', '$localStorage', 'toast', '$location', 'dataShare',
            function ($scope, $localStorage, toast, $location, dataShare) {


                $scope.$on('user_info', function () {
                    $scope.wishlist_mine = $scope.$parent.user.lists_mine;
                })
                $scope.wishlist_mine = $scope.$parent.user.lists_mine;
                $scope.me = false;
                if ($scope.$parent.user._id == $localStorage.user.id) {
                    $scope.me = true;
                }

                $scope.viewList = function (list) {
                    var list_id = list._id;
                    console.log('/app/wishlist_item/' + list_id + "/" + list.name);
                    $location.path('/app/wishlist_item/' + list_id + "/" + list.name);
                };
                $scope.editList = function (list) {
                    if ($scope.me) {
                        dataShare.broadcastData(list, 'edit_list');
                        $location.path('/app/wishlist_edit');
                    } else {
                        toast.showShortBottom('You Cannot Edit This List');
                    }
                };

            }
        ]);