profileMod.controller('ProfileListMineCtrl',
        ['$scope', '$localStorage',
            function ($scope, $localStorage) {
                $scope.$on('doRefresh', function () {
                   $scope.$emit('getUserData');
                });
                var shared_lists = [];
                var public_lists = [];
                var private_lists = [];
                var self = this;
                $scope.$on('user_info', function () {
                    if ($scope.$parent.user._id === $localStorage.user.id) {
                        $scope.me = true;
                    }
                    self.genData();
                });
                $scope.me = false;
                if ($scope.$parent.user._id === $localStorage.user.id) {
                    $scope.me = true;
                }
                self.genData = function () {
                    console.log('gen data');
                    var wishlists = $scope.$parent.user.lists_mine;
                    if (wishlists) {
                        for (var i = 0; i < wishlists.length; i++) {
                            if ($scope.me) {
                                wishlists[i].can_edit = true;
                            }
                            if (wishlists[i].type === 'public') {
                                if (wishlists[i]._id)
                                    public_lists.push(wishlists[i]);
                            }
                            if (wishlists[i].type === 'private') {
                                if (wishlists[i]._id)
                                    private_lists.push(wishlists[i]);
                            }
                            if (wishlists[i].type === 'shared') {
                                if (wishlists[i]._id) {
                                    wishlists[i].user_id = $localStorage.user;
                                    shared_lists.push(wishlists[i]);
                                }
                            }

                        }
                    }
                    var wishlists = $scope.$parent.user.lists_shared;
                    if (wishlists) {
                        for (var i = 0; i < wishlists.length; i++) {
                            if (wishlists[i]._id)
                                shared_lists.push(wishlists[i]);
                        }
                    }
                    console.log(shared_lists);
                    $scope.shared_lists = shared_lists;
                    $scope.public_lists = public_lists;
                    $scope.private_lists = private_lists;

                    if (!$scope.me) {
                        $scope.shared_lists = [];
                        $scope.private_lists = [];
                    }
                }
                self.genData();
            }
        ]);